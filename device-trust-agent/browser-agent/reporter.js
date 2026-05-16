/**
 * MedTrustX Browser Agent — Trust Report Reporter
 *
 * POSTs the browser trust report to /api/zta/browser-attest.
 * Handles retries with exponential backoff (3 attempts).
 *
 * Report schema:
 *   mode:             "browser"
 *   user_agent:       navigator.userAgent
 *   scores:           { os_patch, certificate, network, behavioral, fingerprint }
 *   composite_score:  number (capped at 7.0)
 *   trust_level:      "BLOCKED" | "RESTRICTED" | "STANDARD" | "TRUSTED"
 *   timestamp:        ISO-8601 UTC string
 *   browser_info:     { language, platform, timezone, screen_width, screen_height,
 *                       color_depth, hardware_concurrency, device_memory,
 *                       connection_type, do_not_track }
 *   session_id:       random UUID for this browser session
 *
 * SECURITY: The report is sent with credentials: "include" so the
 * existing session cookies are forwarded, allowing zta-service to
 * correlate the browser report with an authenticated user session.
 * No secrets are stored in JS; the endpoint validates trust server-side.
 */

(function (root, factory) {
  /* Universal Module Definition — works in Web Workers, browsers, Node */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else if (typeof self !== "undefined") {
    self.MedTrustXReporter = factory();
  } else {
    root.MedTrustXReporter = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // ── Constants ────────────────────────────────────────────────────────────

  const BROWSER_ATTEST_PATH = "/api/zta/browser-attest";
  const MAX_ATTEMPTS = 3;
  const BASE_BACKOFF_MS = 2000; // 2 s → 4 s → 8 s
  const REPORT_TIMEOUT_MS = 15000; // 15 s per attempt

  // Trust level thresholds (must mirror score_engine.py / access_policy.py)
  const TRUST_LEVELS = [
    { level: "BLOCKED",    max: 3.0 },
    { level: "RESTRICTED", max: 6.0 },
    { level: "STANDARD",   max: 8.5 },
    { level: "TRUSTED",    max: 10.0 },
  ];

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Generate a random UUID v4 string.
   * Uses crypto.getRandomValues when available.
   * @returns {string} UUID v4
   */
  function _generateUUID() {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.getRandomValues === "function"
    ) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant RFC 4122
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20),
      ].join("-");
    }
    // Fallback (non-cryptographic) for very old environments
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Classify a composite score into a trust level string.
   * @param {number} score
   * @returns {string}
   */
  function _classifyTrustLevel(score) {
    for (const { level, max } of TRUST_LEVELS) {
      if (score <= max) return level;
    }
    return "TRUSTED";
  }

  /**
   * Sleep for the given number of milliseconds.
   * @param {number} ms
   * @returns {Promise<void>}
   */
  function _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Collect safe browser environment metadata for the report.
   * No PII beyond what the server-side already knows from TLS headers.
   * @returns {Object}
   */
  function _collectBrowserInfo() {
    const info = {
      language: "unknown",
      platform: "unknown",
      timezone: "unknown",
      screen_width: 0,
      screen_height: 0,
      color_depth: 0,
      hardware_concurrency: 0,
      device_memory: 0,
      connection_type: "unknown",
      do_not_track: false,
    };

    try {
      if (typeof navigator !== "undefined") {
        info.language = navigator.language || navigator.userLanguage || "unknown";
        info.platform = navigator.platform || "unknown";
        info.hardware_concurrency = navigator.hardwareConcurrency || 0;
        info.device_memory = navigator.deviceMemory || 0;
        info.do_not_track =
          navigator.doNotTrack === "1" || navigator.doNotTrack === true;

        if (navigator.connection) {
          info.connection_type =
            navigator.connection.effectiveType ||
            navigator.connection.type ||
            "unknown";
        }
      }

      if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
        info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
      }

      if (typeof screen !== "undefined") {
        info.screen_width = screen.width || 0;
        info.screen_height = screen.height || 0;
        info.color_depth = screen.colorDepth || 0;
      }
    } catch (_e) {
      // Ignore — return whatever was collected
    }

    return info;
  }

  /**
   * Build the full report payload.
   * @param {Object} scores      — { os_patch, certificate, network, behavioral, fingerprint }
   * @param {number} compositeScore — already capped at 7.0
   * @param {string} sessionId   — UUID for this browser session
   * @returns {Object}
   */
  function _buildPayload(scores, compositeScore, sessionId) {
    return {
      mode: "browser",
      session_id: sessionId,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      scores: {
        os_patch:    typeof scores.os_patch    === "number" ? scores.os_patch    : null,
        certificate: typeof scores.certificate === "number" ? scores.certificate : null,
        network:     typeof scores.network     === "number" ? scores.network     : null,
        behavioral:  typeof scores.behavioral  === "number" ? scores.behavioral  : null,
        fingerprint: typeof scores.fingerprint === "number" ? scores.fingerprint : null,
      },
      composite_score: compositeScore,
      trust_level: _classifyTrustLevel(compositeScore),
      timestamp: new Date().toISOString(),
      browser_info: _collectBrowserInfo(),
    };
  }

  /**
   * Send a single HTTP POST attempt with an AbortController timeout.
   * @param {string} url
   * @param {Object} payload
   * @returns {Promise<{ok: boolean, status: number, body: Object|null}>}
   */
  async function _postOnce(url, payload) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), REPORT_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Identify ourselves as the browser agent
          "X-MedTrustX-Mode": "browser",
          "X-MedTrustX-Version": "1.0.0",
        },
        body: JSON.stringify(payload),
        credentials: "include", // forward session cookies for user correlation
        signal: controller.signal,
      });

      let body = null;
      try {
        body = await response.json();
      } catch (_e) {
        // Non-JSON body — acceptable for non-200 responses
      }

      return { ok: response.ok, status: response.status, body };
    } catch (err) {
      if (err.name === "AbortError") {
        return { ok: false, status: 0, body: null, error: "timeout" };
      }
      return { ok: false, status: 0, body: null, error: String(err) };
    } finally {
      clearTimeout(timerId);
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * BrowserReporter — sends browser trust reports to the ZTA service.
   *
   * Usage:
   *   const reporter = new BrowserReporter({ baseUrl: "https://zta.example.com" });
   *   const result = await reporter.submit(scores, compositeScore);
   */
  class BrowserReporter {
    /**
     * @param {Object} options
     * @param {string} [options.baseUrl]       — base URL of zta-service (default: same origin)
     * @param {number} [options.maxAttempts]   — retry limit (default: 3)
     * @param {number} [options.baseBackoffMs] — base retry delay ms (default: 2000)
     */
    constructor(options = {}) {
      this._baseUrl       = (options.baseUrl || "").replace(/\/$/, "");
      this._maxAttempts   = options.maxAttempts   || MAX_ATTEMPTS;
      this._baseBackoffMs = options.baseBackoffMs || BASE_BACKOFF_MS;
      this._sessionId     = _generateUUID();
      this._lastResult    = null;
    }

    /**
     * Submit a browser trust report with exponential-backoff retries.
     *
     * @param {Object} scores        — { os_patch?, certificate?, network?, behavioral?, fingerprint? }
     * @param {number} compositeScore — composite score capped at 7.0
     * @returns {Promise<{
     *   submitted: boolean,
     *   attempts:  number,
     *   status:    number|null,
     *   response:  Object|null,
     *   error:     string|null,
     *   trust_level: string,
     *   composite_score: number,
     * }>}
     */
    async submit(scores, compositeScore) {
      const url     = this._baseUrl + BROWSER_ATTEST_PATH;
      const payload = _buildPayload(scores, compositeScore, this._sessionId);
      const result  = {
        submitted:       false,
        attempts:        0,
        status:          null,
        response:        null,
        error:           null,
        trust_level:     payload.trust_level,
        composite_score: compositeScore,
      };

      for (let attempt = 1; attempt <= this._maxAttempts; attempt++) {
        result.attempts = attempt;

        const outcome = await _postOnce(url, payload);
        result.status   = outcome.status;
        result.response = outcome.body;

        if (outcome.ok) {
          result.submitted = true;
          result.error     = null;
          this._lastResult = result;
          return result;
        }

        result.error = outcome.error
          ? `${outcome.error}`
          : `HTTP ${outcome.status}`;

        // 4xx errors are not retryable (bad request / unauthorized)
        if (outcome.status >= 400 && outcome.status < 500) {
          break;
        }

        // Back off before next attempt (skip on final attempt)
        if (attempt < this._maxAttempts) {
          const backoffMs = this._baseBackoffMs * Math.pow(2, attempt - 1);
          await _sleep(backoffMs);
        }
      }

      this._lastResult = result;
      return result;
    }

    /**
     * Return the result of the most recent submit() call.
     * @returns {Object|null}
     */
    getLastResult() {
      return this._lastResult;
    }

    /**
     * Return the session UUID associated with this reporter instance.
     * The same session_id is sent in every report for server-side correlation.
     * @returns {string}
     */
    getSessionId() {
      return this._sessionId;
    }
  }

  // ── Module export ─────────────────────────────────────────────────────────

  return { BrowserReporter, _classifyTrustLevel, _generateUUID };
});
