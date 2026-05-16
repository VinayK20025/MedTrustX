/**
 * MedTrustX Browser Agent — Web Worker Orchestrator
 *
 * Runs as a Web Worker (or inline via <script>) and:
 *   1. Imports checks.js and reporter.js
 *   2. Runs all available browser checks (os_patch, certificate, network,
 *      behavioral, fingerprint) in parallel every CHECK_INTERVAL_MS
 *   3. Computes the capped composite score (≤ 7.0)
 *   4. Reports to /api/zta/browser-attest via BrowserReporter
 *   5. Posts result messages to the parent window/service-worker
 *
 * Message protocol (parent → worker):
 *   { type: "START",  options: { baseUrl?, intervalMs? } }  — start scheduler
 *   { type: "STOP" }                                         — stop scheduler
 *   { type: "RUN_NOW" }                                      — immediate cycle
 *   { type: "STATUS" }                                       — query last report
 *
 * Message protocol (worker → parent):
 *   { type: "READY" }
 *   { type: "CYCLE_COMPLETE", data: { scores, compositeScore, trustLevel,
 *                                      submitted, timestamp, cycleCount } }
 *   { type: "CYCLE_ERROR",   error: string }
 *   { type: "STATUS_REPORT", data: lastResult }
 *   { type: "STOPPED" }
 *
 * SECURITY: The worker does not store or log user credentials. It only
 * reads/writes the medtrustx_* keys in localStorage as defined in checks.js.
 * Communications are same-origin; the Web Worker sandbox prevents CORS abuse.
 */

(function () {
  "use strict";

  // ── Constants ─────────────────────────────────────────────────────────────

  const DEFAULT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  const MIN_INTERVAL_MS     = 30 * 1000;      // 30 seconds (floor guard)
  const CHECK_TIMEOUT_MS    = 30 * 1000;      // 30 s per individual check
  const AGENT_VERSION       = "1.0.0";

  // ── State ─────────────────────────────────────────────────────────────────

  let _reporter        = null;
  let _intervalId      = null;
  let _lastResult      = null;
  let _cycleCount      = 0;
  let _running         = false;
  let _baseUrl         = "";
  let _intervalMs      = DEFAULT_INTERVAL_MS;

  // ── Lazy-resolve imported modules ─────────────────────────────────────────

  /**
   * Return the MedTrustXChecks module.
   * Works in Workers (importScripts) and module contexts.
   * @returns {Object}
   */
  function _getChecks() {
    if (typeof MedTrustXChecks !== "undefined") return MedTrustXChecks;
    if (typeof self !== "undefined" && self.MedTrustXChecks)
      return self.MedTrustXChecks;
    if (typeof module !== "undefined" && module.exports) {
      // Node / Jest test environment
      try {
        return require("./checks.js");
      } catch (_e) {}
    }
    throw new Error("MedTrustXChecks not found — ensure checks.js is loaded first");
  }

  /**
   * Return the MedTrustXReporter module.
   * @returns {Object}
   */
  function _getReporter() {
    if (typeof MedTrustXReporter !== "undefined") return MedTrustXReporter;
    if (typeof self !== "undefined" && self.MedTrustXReporter)
      return self.MedTrustXReporter;
    if (typeof module !== "undefined" && module.exports) {
      try {
        return require("./reporter.js");
      } catch (_e) {}
    }
    throw new Error("MedTrustXReporter not found — ensure reporter.js is loaded first");
  }

  // ── Check execution helpers ───────────────────────────────────────────────

  /**
   * Run a single check function with a timeout guard.
   * @param {Function} checkFn — async function returning a number
   * @param {string}   name    — check name for error logging
   * @returns {Promise<number|null>}
   */
  async function _runCheck(checkFn, name) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(1); // timed-out checks default to lowest safe score
      }, CHECK_TIMEOUT_MS);

      Promise.resolve()
        .then(() => checkFn())
        .then((score) => {
          clearTimeout(timer);
          const clamped = Math.max(1, Math.min(10, Number(score) || 1));
          resolve(clamped);
        })
        .catch((_err) => {
          clearTimeout(timer);
          resolve(1); // failed checks → score 1 (least trusted)
        });
    });
  }

  /**
   * Execute all available browser checks in parallel.
   * Returns a scores object with null for unavailable checks.
   * @param {Object} checks — MedTrustXChecks module
   * @returns {Promise<Object>}
   */
  async function _runAllChecks(checks) {
    const [os_patch, certificate, network, behavioral, fingerprint] =
      await Promise.all([
        typeof checks.browserOsPatch    === "function"
          ? _runCheck(checks.browserOsPatch,    "os_patch")
          : Promise.resolve(null),
        typeof checks.browserCertificate === "function"
          ? _runCheck(checks.browserCertificate, "certificate")
          : Promise.resolve(null),
        typeof checks.browserNetwork    === "function"
          ? _runCheck(checks.browserNetwork,    "network")
          : Promise.resolve(null),
        typeof checks.browserBehavioral === "function"
          ? _runCheck(checks.browserBehavioral, "behavioral")
          : Promise.resolve(null),
        typeof checks.browserFingerprint === "function"
          ? _runCheck(checks.browserFingerprint, "fingerprint")
          : Promise.resolve(null),
      ]);

    return { os_patch, certificate, network, behavioral, fingerprint };
  }

  // ── Main cycle ────────────────────────────────────────────────────────────

  /**
   * Run one complete attestation cycle:
   *  1. Execute all checks
   *  2. Compute composite score (capped at 7.0)
   *  3. Report to zta-service
   *  4. Post CYCLE_COMPLETE message to parent
   */
  async function _runCycle() {
    _cycleCount += 1;
    const cycleNumber = _cycleCount;

    try {
      const checks = _getChecks();
      const scores = await _runAllChecks(checks);

      // computeBrowserCompositeScore handles null scores (absent checks)
      const compositeScore = checks.computeBrowserCompositeScore(scores);

      // Report
      const reporterModule = _getReporter();
      const reporter = _reporter || new reporterModule.BrowserReporter({ baseUrl: _baseUrl });
      const reportResult = await reporter.submit(scores, compositeScore);

      const cycleData = {
        scores,
        compositeScore,
        trustLevel:   reportResult.trust_level,
        submitted:    reportResult.submitted,
        status:       reportResult.status,
        error:        reportResult.error,
        timestamp:    new Date().toISOString(),
        cycleCount:   cycleNumber,
        agentVersion: AGENT_VERSION,
      };

      _lastResult = cycleData;
      _postMessage({ type: "CYCLE_COMPLETE", data: cycleData });
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      _postMessage({ type: "CYCLE_ERROR", error: msg, cycleCount: cycleNumber });
    }
  }

  // ── Messaging helpers ─────────────────────────────────────────────────────

  /**
   * Post a message to the parent context (Worker or window).
   * @param {Object} msg
   */
  function _postMessage(msg) {
    try {
      if (typeof self !== "undefined" && typeof self.postMessage === "function") {
        self.postMessage(msg);
      } else if (
        typeof process !== "undefined" &&
        typeof process.send === "function"
      ) {
        // Node child_process fallback for testing
        process.send(msg);
      }
    } catch (_e) {
      // Ignore — cannot reach parent
    }
  }

  // ── Scheduler control ─────────────────────────────────────────────────────

  /**
   * Start the periodic attestation scheduler.
   * @param {Object} options — { baseUrl?, intervalMs? }
   */
  function _start(options) {
    if (_running) return; // already started

    options = options || {};
    _baseUrl    = (options.baseUrl || "").replace(/\/$/, "");
    _intervalMs = Math.max(
      MIN_INTERVAL_MS,
      options.intervalMs || DEFAULT_INTERVAL_MS
    );

    // Create reporter with configured base URL
    try {
      const reporterModule = _getReporter();
      _reporter = new reporterModule.BrowserReporter({ baseUrl: _baseUrl });
    } catch (_e) {
      _reporter = null; // will be created lazily in _runCycle
    }

    _running = true;
    _postMessage({ type: "READY", agentVersion: AGENT_VERSION });

    // Run immediately, then on interval
    _runCycle().catch(() => {}); // errors posted inside _runCycle
    _intervalId = setInterval(() => {
      if (_running) _runCycle().catch(() => {});
    }, _intervalMs);
  }

  /**
   * Stop the scheduler and post STOPPED.
   */
  function _stop() {
    _running = false;
    if (_intervalId !== null) {
      clearInterval(_intervalId);
      _intervalId = null;
    }
    _postMessage({ type: "STOPPED" });
  }

  // ── Message handler ───────────────────────────────────────────────────────

  if (typeof self !== "undefined" && typeof self.addEventListener === "function") {
    self.addEventListener("message", function (event) {
      const msg = event.data || {};

      switch (msg.type) {
        case "START":
          _start(msg.options || {});
          break;

        case "STOP":
          _stop();
          break;

        case "RUN_NOW":
          if (!_running) {
            // Allow a one-shot run without starting the full scheduler
            _runCycle().catch(() => {});
          } else {
            _runCycle().catch(() => {});
          }
          break;

        case "STATUS":
          _postMessage({ type: "STATUS_REPORT", data: _lastResult });
          break;

        default:
          // Unknown message type — ignore silently
          break;
      }
    });
  }

  // ── Auto-start when loaded with data attributes ───────────────────────────
  // If the script is loaded as a classic Worker without a START message,
  // check for a global MEDTRUSTX_AGENT_OPTIONS object set by the loader.

  if (
    typeof MEDTRUSTX_AGENT_OPTIONS !== "undefined" &&
    MEDTRUSTX_AGENT_OPTIONS &&
    MEDTRUSTX_AGENT_OPTIONS.autoStart
  ) {
    _start(MEDTRUSTX_AGENT_OPTIONS);
  }

  // ── Module export (for Node/Jest testing) ─────────────────────────────────

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      start:    _start,
      stop:     _stop,
      runCycle: _runCycle,
      getLastResult: function () { return _lastResult; },
      getCycleCount: function () { return _cycleCount; },
      isRunning:     function () { return _running;     },
    };
  }
})();
