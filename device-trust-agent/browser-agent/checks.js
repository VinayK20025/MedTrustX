/**
 * MedTrustX Device Trust Agent — Browser-Available Security Checks.
 *
 * Implements the subset of trust checks that are accessible from
 * a browser context. Runs inside a Web Worker (no DOM access).
 *
 * Available checks:
 *   browserOsPatch()      — UA parsing, max score 7 (limited accuracy)
 *   browserCertificate()  — WebCrypto device registration verification
 *   browserNetwork()      — WebRTC IP leak, DNS timing, connection type
 *   browserBehavioral()   — localStorage login pattern analysis (5 signals)
 *   browserFingerprint()  — Canvas + font fingerprint consistency check
 *
 * Browser mode composite score is capped at 7.0.
 */

"use strict";

// ── Scoring weights for available browser checks ───────────────────────────
const BROWSER_WEIGHTS = {
  os_patch:    0.15,
  certificate: 0.25,   // redistributed weight from unavailable checks
  network:     0.30,
  behavioral:  0.20,
  fingerprint: 0.10,
};

const BROWSER_SCORE_CAP = 7.0;

// localStorage keys
const STORAGE_KEY_LOGIN_TIMES  = "medtrustx_login_times";
const STORAGE_KEY_KNOWN_IPS    = "medtrustx_known_ips";
const STORAGE_KEY_FINGERPRINT  = "medtrustx_canvas_fingerprint";
const STORAGE_KEY_REQUESTS     = "medtrustx_request_counts";

// ── Check 1 (partial): OS Patch Level via User-Agent ──────────────────────

/**
 * Parse navigator.userAgent and map to a best-effort OS version score.
 * Maximum score is 7 due to UA string unreliability.
 *
 * @returns {{ score: number, details: object, recommendations: string[] }}
 */
function browserOsPatch() {
  const ua = navigator.userAgent || "";
  const details = { user_agent: ua, parsed: {} };
  const recommendations = [];

  // Windows detection
  const winMatch = ua.match(/Windows NT (\d+\.\d+)/);
  if (winMatch) {
    const nt = parseFloat(winMatch[1]);
    details.parsed.os = "Windows";
    details.parsed.nt_version = nt;
    // NT 10.0 = Windows 10/11
    if (nt >= 10.0) {
      return { score: 7.0, details, recommendations: ["Windows 10/11 detected via UA."] };
    }
    recommendations.push("Windows version appears outdated. Update to Windows 10 21H2+.");
    return { score: 3.0, details, recommendations };
  }

  // macOS detection
  const macMatch = ua.match(/Mac OS X (\d+[._]\d+(?:[._]\d+)?)/);
  if (macMatch) {
    const verStr = macMatch[1].replace(/_/g, ".");
    const parts  = verStr.split(".").map(Number);
    const major  = parts[0] || 0;
    const minor  = parts[1] || 0;
    details.parsed.os = "macOS";
    details.parsed.version = verStr;
    // 14.x = Sonoma, 13.x = Ventura (minimum)
    if (major >= 14) {
      return { score: 7.0, details, recommendations: ["macOS Sonoma detected."] };
    }
    if (major === 13) {
      return { score: 6.0, details, recommendations: ["macOS Ventura detected. Consider upgrading to Sonoma."] };
    }
    recommendations.push(`macOS ${verStr} is below minimum. Upgrade to Ventura 13+ or Sonoma 14+.`);
    return { score: 2.0, details, recommendations };
  }

  // Linux
  if (/Linux/.test(ua) && !/Android/.test(ua)) {
    details.parsed.os = "Linux";
    return { score: 5.0, details, recommendations: ["Linux detected. Full patch check requires native agent."] };
  }

  // Android
  const androidMatch = ua.match(/Android (\d+\.\d*)/);
  if (androidMatch) {
    const ver = parseFloat(androidMatch[1]);
    details.parsed.os = "Android";
    details.parsed.version = androidMatch[1];
    if (ver >= 12) {
      return { score: 6.0, details, recommendations: ["Android 12+ detected."] };
    }
    recommendations.push(`Android ${androidMatch[1]} is below minimum. Upgrade to Android 12+.`);
    return { score: 2.0, details, recommendations };
  }

  // iOS
  const iosMatch = ua.match(/OS (\d+[._]\d*)/);
  if (/iPhone|iPad/.test(ua) && iosMatch) {
    const ver = parseFloat(iosMatch[1].replace("_", "."));
    details.parsed.os = "iOS";
    details.parsed.version = iosMatch[1].replace("_", ".");
    if (ver >= 17) {
      return { score: 7.0, details, recommendations: ["iOS 17+ detected."] };
    }
    recommendations.push(`iOS ${details.parsed.version} is below minimum. Upgrade to iOS 17+.`);
    return { score: 2.0, details, recommendations };
  }

  return { score: 3.0, details, recommendations: ["Could not parse OS from User-Agent."] };
}

// ── Check 7 (browser): Certificate / Device Registration ─────────────────

/**
 * Verify device registration using WebCrypto.
 * Generates an ephemeral key pair, posts the public key and a server
 * challenge to zta-service, and scores based on registration status.
 *
 * @param {string} ztaServiceUrl  — base URL of zta-service
 * @returns {Promise<{ score: number, details: object, recommendations: string[] }>}
 */
async function browserCertificate(ztaServiceUrl) {
  const details = {};
  const recommendations = [];

  try {
    // Generate ephemeral ECDSA P-256 key pair
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );

    // Export public key as JWK
    const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    details.public_key_generated = true;
    details.key_algorithm = "ECDSA-P256";

    // Get browser fingerprint as device challenge context
    const fpHash = await _computeCanvasFingerprint();
    const timestamp = new Date().toISOString();

    // Sign the challenge
    const challengeData = new TextEncoder().encode(`${fpHash}|${timestamp}`);
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      keyPair.privateKey,
      challengeData
    );
    const signatureB64 = _arrayBufferToBase64(signature);

    // POST to zta-service browser attestation endpoint
    const payload = {
      public_key_jwk: publicKeyJwk,
      fingerprint: fpHash,
      signature: signatureB64,
      timestamp,
      user_agent: navigator.userAgent,
    };

    const response = await fetch(`${ztaServiceUrl}/api/zta/browser-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const result = await response.json();
      details.registered = result.registered === true;
      details.device_id   = result.device_id || null;

      if (result.registered) {
        return { score: 10.0, details, recommendations: ["Device is registered with MedTrustX."] };
      }
      recommendations.push("Browser device is not registered. Install the native agent for full trust.");
      return { score: 1.0, details, recommendations };
    }

    // Non-200 but service responded — score 5 (can reach service, unknown device)
    details.http_status = response.status;
    recommendations.push("Device registration status unknown. Check zta-service connectivity.");
    return { score: 5.0, details, recommendations };

  } catch (err) {
    details.error = String(err);
    recommendations.push("Certificate check failed. WebCrypto or network error.");
    return { score: 3.0, details, recommendations };
  }
}

// ── Check 8 (browser): Network Security Posture ───────────────────────────

/**
 * Evaluate network security using WebRTC ICE candidate enumeration,
 * navigator.connection, and DNS timing measurements.
 *
 * @returns {Promise<{ score: number, details: object, recommendations: string[] }>}
 */
async function browserNetwork() {
  const details = {};
  const recommendations = [];

  // Collect local IPs via WebRTC ICE candidates
  const localIps = await _collectWebRTCIps();
  details.local_ips = localIps;

  // Check if any IP is in corporate 10.0.0.0/8 range
  const onCorporateNetwork = localIps.some(ip => ip.startsWith("10."));
  details.corporate_network = onCorporateNetwork;

  // navigator.connection — effective connection type
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    details.connection_type = conn.type || conn.effectiveType || "unknown";
    details.downlink_mbps   = conn.downlink || null;
  }

  // DNS timing check — fast resolution of internal hostname suggests corporate DNS
  const dnsLatencyMs = await _measureDnsLatency();
  details.dns_latency_ms = dnsLatencyMs;
  const fastDns = dnsLatencyMs !== null && dnsLatencyMs < 50;
  details.fast_dns = fastDns;

  // Detect VPN heuristic: if IP is in 10.x but UA suggests public browser
  const likelyVpn = onCorporateNetwork && !localIps.some(ip => _isPrivateLan(ip));
  details.likely_vpn = likelyVpn;

  // Score
  if (onCorporateNetwork && fastDns) {
    return { score: 7.0, details, recommendations: ["On corporate network with fast DNS."] };
  }
  if (onCorporateNetwork) {
    return { score: 6.0, details, recommendations: ["On corporate network."] };
  }
  if (likelyVpn) {
    return { score: 5.0, details, recommendations: ["VPN likely active."] };
  }

  recommendations.push("Not on corporate network. Connect via MedTrustX VPN before accessing clinical data.");
  return { score: 3.0, details, recommendations };
}

/**
 * Collect local IP addresses via WebRTC ICE candidate enumeration.
 * @returns {Promise<string[]>}
 */
async function _collectWebRTCIps() {
  return new Promise((resolve) => {
    const ips = new Set();
    const timeout = setTimeout(() => resolve([...ips]), 2000);

    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel("");
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          clearTimeout(timeout);
          pc.close();
          resolve([...ips]);
          return;
        }
        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
        if (ipMatch) ips.add(ipMatch[1]);
      };
    } catch {
      clearTimeout(timeout);
      resolve([]);
    }
  });
}

/**
 * Measure DNS resolution latency by fetching a known-fast internal resource.
 * @returns {Promise<number|null>} — latency in ms, or null on error
 */
async function _measureDnsLatency() {
  const start = performance.now();
  try {
    await fetch("/api/health", {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    return Math.round(performance.now() - start);
  } catch {
    return null;
  }
}

/** Return true if IP is in RFC-1918 LAN range (192.168.x.x or 172.16-31.x.x). */
function _isPrivateLan(ip) {
  return /^192\.168\./.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
}

// ── Check 10 (browser): Behavioral Anomaly ────────────────────────────────

/**
 * Analyse behavioral signals from localStorage history.
 * Mirrors the 5-signal model of native Check 10.
 *
 * @returns {{ score: number, details: object, recommendations: string[] }}
 */
function browserBehavioral() {
  const details = {};
  const recommendations = [];
  let anomalyCount = 0;
  const triggeredSignals = [];

  const now        = new Date();
  const currentHour = now.getUTCHours();

  // ── Signal A: Unusual login hour ──────────────────────────────────────
  const loginTimes = _loadJsonFromStorage(STORAGE_KEY_LOGIN_TIMES, []);
  if (loginTimes.length >= 5) {
    const hourCounts = {};
    loginTimes.forEach(h => { hourCounts[h] = (hourCounts[h] || 0) + 1; });
    const topHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(e => parseInt(e[0], 10));
    const isUnusual = !topHours.includes(currentHour);
    details.signal_a = { current_hour: currentHour, typical_hours: topHours, triggered: isUnusual };
    if (isUnusual) {
      anomalyCount++;
      triggeredSignals.push("A:unusual_hour");
      recommendations.push(`Login at unusual hour ${currentHour}:00 UTC.`);
    }
  }

  // ── Signal B: New IP/location ──────────────────────────────────────────
  // Browser can't reliably get IP — skip with no penalty
  details.signal_b = { skipped: "browser_cannot_resolve_external_ip" };

  // ── Signal C: Failed auth attempts ────────────────────────────────────
  // Read from localStorage if available (injected by the app)
  const failedAttempts = parseInt(localStorage.getItem("medtrustx_failed_attempts_24h") || "0", 10);
  const failedTriggered = failedAttempts > 3;
  details.signal_c = { failed_attempts_24h: failedAttempts, triggered: failedTriggered };
  if (failedTriggered) {
    anomalyCount++;
    triggeredSignals.push("C:failed_auth_spike");
    recommendations.push(`${failedAttempts} failed auth attempts in last 24h.`);
  }

  // ── Signal D: Request velocity ────────────────────────────────────────
  const requestCounts = _loadJsonFromStorage(STORAGE_KEY_REQUESTS, []);
  if (requestCounts.length >= 5) {
    const avg = requestCounts.slice(-30).reduce((a, b) => a + b, 0) / Math.min(requestCounts.length, 30);
    const current = requestCounts[requestCounts.length - 1] || 0;
    const velocityTriggered = avg > 0 && current > avg * 5;
    details.signal_d = { current_rpm: current, avg_rpm: avg, triggered: velocityTriggered };
    if (velocityTriggered) {
      anomalyCount++;
      triggeredSignals.push("D:high_velocity");
      recommendations.push(`Request velocity (${current} rpm) is 5× above baseline (${avg.toFixed(1)} rpm).`);
    }
  }

  // ── Signal E: Simultaneous device ─────────────────────────────────────
  // Read from app-injected flag
  const concurrentSession = localStorage.getItem("medtrustx_concurrent_session") === "true";
  details.signal_e = { triggered: concurrentSession };
  if (concurrentSession) {
    anomalyCount++;
    triggeredSignals.push("E:simultaneous_device");
    recommendations.push("Concurrent session detected on another device.");
  }

  details.anomaly_count   = anomalyCount;
  details.triggered_signals = triggeredSignals;

  // Record this login time
  const updatedTimes = [...loginTimes.slice(-99), currentHour];
  _saveJsonToStorage(STORAGE_KEY_LOGIN_TIMES, updatedTimes);

  const scoreMap = { 0: 10.0, 1: 8.0, 2: 5.0, 3: 3.0 };
  const score = scoreMap[anomalyCount] ?? 1.0;

  if (anomalyCount === 0) recommendations.push("No behavioral anomalies detected.");

  return { score, details, recommendations };
}

// ── Browser device fingerprint (consistency check) ────────────────────────

/**
 * Compute canvas fingerprint and compare against stored baseline.
 * A changed fingerprint indicates a different browser/device.
 *
 * @returns {Promise<{ score: number, details: object, recommendations: string[] }>}
 */
async function browserFingerprint() {
  const details = {};
  const recommendations = [];

  const currentHash = await _computeCanvasFingerprint();
  details.current_hash = currentHash.substring(0, 16) + "...";

  const storedHash = localStorage.getItem(STORAGE_KEY_FINGERPRINT);

  if (!storedHash) {
    // First visit — store the fingerprint
    localStorage.setItem(STORAGE_KEY_FINGERPRINT, currentHash);
    return {
      score: 7.0,
      details: { ...details, first_visit: true },
      recommendations: ["Browser fingerprint recorded for future comparison."],
    };
  }

  const matches = currentHash === storedHash;
  details.stored_hash  = storedHash.substring(0, 16) + "...";
  details.match        = matches;

  if (matches) {
    return { score: 10.0, details, recommendations: ["Browser fingerprint matches baseline."] };
  }

  recommendations.push(
    "Browser fingerprint changed. Device or browser may have changed. " +
    "Re-authenticate if this is unexpected."
  );
  // Update stored fingerprint to new value
  localStorage.setItem(STORAGE_KEY_FINGERPRINT, currentHash);
  return { score: 4.0, details, recommendations };
}

/**
 * Compute a canvas + font fingerprint hash.
 * Draws deterministic shapes and text; hashes the pixel data.
 *
 * @returns {Promise<string>} — hex SHA-256 digest
 */
async function _computeCanvasFingerprint() {
  try {
    const canvas  = new OffscreenCanvas(200, 40);
    const ctx     = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, 200, 40);

    // Text with specific font settings
    ctx.fillStyle = "#1a237e";
    ctx.font      = "14px Arial, sans-serif";
    ctx.fillText("MedTrustX\u00AE\u2665", 10, 20);

    // Geometric shape
    ctx.strokeStyle = "#4caf50";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(170, 20, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Additional gradient for rendering engine differentiation
    const grad = ctx.createLinearGradient(0, 0, 200, 0);
    grad.addColorStop(0, "rgba(100,149,237,0.5)");
    grad.addColorStop(1, "rgba(238,130,238,0.5)");
    ctx.fillStyle = grad;
    ctx.fillRect(5, 30, 190, 5);

    const blob        = await canvas.convertToBlob({ type: "image/png" });
    const arrayBuffer = await blob.arrayBuffer();
    const hashBuffer  = await crypto.subtle.digest("SHA-256", arrayBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // OffscreenCanvas not supported — use a UA-based fallback
    const data = navigator.userAgent + navigator.language + screen.colorDepth;
    const encoded = new TextEncoder().encode(data);
    const hash = await crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
}

// ── Composite score computation (browser mode) ────────────────────────────

/**
 * Compute the weighted average of browser check scores and cap at 7.0.
 *
 * @param {object} scores — { os_patch, certificate, network, behavioral, fingerprint }
 * @returns {number} — capped composite score
 */
function computeBrowserCompositeScore(scores) {
  const weights = BROWSER_WEIGHTS;
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [key, weight] of Object.entries(weights)) {
    if (scores[key] !== undefined && scores[key] !== null) {
      weightedSum += scores[key] * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return 1.0;
  const raw = weightedSum / totalWeight;
  return Math.round(Math.min(raw, BROWSER_SCORE_CAP) * 100) / 100;
}

// ── localStorage helpers ──────────────────────────────────────────────────

function _loadJsonFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function _saveJsonToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage quota exceeded — ignore */
  }
}

function _arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary  = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// ── Exports (used by agent.js) ────────────────────────────────────────────

if (typeof self !== "undefined" && typeof WorkerGlobalScope !== "undefined") {
  // Running inside Web Worker
  self.MedTrustXChecks = {
    browserOsPatch,
    browserCertificate,
    browserNetwork,
    browserBehavioral,
    browserFingerprint,
    computeBrowserCompositeScore,
    BROWSER_SCORE_CAP,
  };
} else if (typeof module !== "undefined" && module.exports) {
  // Node.js / test environment
  module.exports = {
    browserOsPatch,
    browserCertificate,
    browserNetwork,
    browserBehavioral,
    browserFingerprint,
    computeBrowserCompositeScore,
    BROWSER_SCORE_CAP,
  };
}
