"""
Tests for the browser-agent JavaScript modules.

These tests run the JS modules in a Node.js subprocess (if available),
or validate the module structure / exported API at a file-content level.

Test groups:
  - checks.js  : module structure, function exports, score capping
  - reporter.js: BrowserReporter class, retry logic, payload shape
  - agent.js   : Web Worker message protocol, start/stop lifecycle
  - Composite score cap at 7.0 (absolute rule)
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest


# ── Paths ─────────────────────────────────────────────────────────────────────

BROWSER_AGENT_DIR = Path(__file__).parent.parent / "browser-agent"
CHECKS_JS    = BROWSER_AGENT_DIR / "checks.js"
REPORTER_JS  = BROWSER_AGENT_DIR / "reporter.js"
AGENT_JS     = BROWSER_AGENT_DIR / "agent.js"
LOADER_HTML  = BROWSER_AGENT_DIR / "loader.html"


# ── Node.js availability ──────────────────────────────────────────────────────

def _node_available() -> bool:
    try:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True, timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


HAS_NODE = _node_available()
node_only = pytest.mark.skipif(not HAS_NODE, reason="Node.js not available")


def _run_js(script: str, timeout: int = 10) -> dict:
    """Run a JS snippet in Node and return parsed JSON output."""
    result = subprocess.run(
        ["node", "--input-type=module", "-e", script]
        if "--input-type=module" in script
        else ["node", "-e", script],
        capture_output=True, text=True, timeout=timeout
    )
    return {
        "returncode": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }


# ── File existence checks ─────────────────────────────────────────────────────

class TestBrowserAgentFilesExist:
    def test_checks_js_exists(self):
        assert CHECKS_JS.exists(), f"Missing: {CHECKS_JS}"

    def test_reporter_js_exists(self):
        assert REPORTER_JS.exists(), f"Missing: {REPORTER_JS}"

    def test_agent_js_exists(self):
        assert AGENT_JS.exists(), f"Missing: {AGENT_JS}"

    def test_loader_html_exists(self):
        assert LOADER_HTML.exists(), f"Missing: {LOADER_HTML}"


# ── checks.js structure (static analysis) ────────────────────────────────────

class TestChecksJsStructure:
    def _read(self) -> str:
        return CHECKS_JS.read_text(encoding="utf-8")

    def test_exports_browserOsPatch(self):
        assert "browserOsPatch" in self._read()

    def test_exports_browserCertificate(self):
        assert "browserCertificate" in self._read()

    def test_exports_browserNetwork(self):
        assert "browserNetwork" in self._read()

    def test_exports_browserBehavioral(self):
        assert "browserBehavioral" in self._read()

    def test_exports_browserFingerprint(self):
        assert "browserFingerprint" in self._read()

    def test_exports_computeBrowserCompositeScore(self):
        assert "computeBrowserCompositeScore" in self._read()

    def test_composite_score_cap_at_7(self):
        """The cap at 7.0 must be present in the scoring function."""
        content = self._read()
        assert "7.0" in content or "7)" in content

    def test_umd_module_definition(self):
        """UMD wrapper must support both Worker (self) and Node (module.exports)."""
        content = self._read()
        assert "module.exports" in content
        assert "self.MedTrustXChecks" in content or "MedTrustXChecks" in content

    def test_webcrypto_ecdsa_present(self):
        """Certificate check must use WebCrypto ECDSA."""
        content = self._read()
        assert "ECDSA" in content or "P-256" in content

    def test_offscreencanvas_fingerprint(self):
        """Fingerprint check must reference OffscreenCanvas."""
        content = self._read()
        assert "OffscreenCanvas" in content

    def test_localstorage_behavioral_keys(self):
        """Behavioral check must use medtrustx_ localStorage keys."""
        content = self._read()
        assert "medtrustx_login_times" in content or "medtrustx_" in content


# ── reporter.js structure ─────────────────────────────────────────────────────

class TestReporterJsStructure:
    def _read(self) -> str:
        return REPORTER_JS.read_text(encoding="utf-8")

    def test_BrowserReporter_class(self):
        assert "BrowserReporter" in self._read()

    def test_submit_method(self):
        assert "submit" in self._read()

    def test_browser_attest_endpoint(self):
        assert "/api/zta/browser-attest" in self._read()

    def test_retry_logic_present(self):
        content = self._read()
        assert "attempt" in content or "retry" in content.lower()

    def test_max_attempts_3(self):
        assert "MAX_ATTEMPTS = 3" in self._read() or "maxAttempts" in self._read()

    def test_credentials_include(self):
        """Must forward session cookies for user correlation."""
        assert 'credentials: "include"' in self._read() or "credentials:'include'" in self._read()

    def test_trust_level_classification(self):
        """Must classify composite score into trust level strings."""
        content = self._read()
        assert "BLOCKED" in content
        assert "RESTRICTED" in content
        assert "STANDARD" in content
        assert "TRUSTED" in content

    def test_threshold_3_0_blocked(self):
        assert "3.0" in self._read()

    def test_threshold_6_0_restricted(self):
        assert "6.0" in self._read()

    def test_threshold_8_5_standard(self):
        assert "8.5" in self._read()

    def test_umd_module_definition(self):
        content = self._read()
        assert "module.exports" in content
        assert "MedTrustXReporter" in content


# ── agent.js structure ────────────────────────────────────────────────────────

class TestAgentJsStructure:
    def _read(self) -> str:
        return AGENT_JS.read_text(encoding="utf-8")

    def test_default_interval_5_minutes(self):
        content = self._read()
        assert "5 * 60 * 1000" in content or "300000" in content

    def test_start_message_handler(self):
        assert '"START"' in self._read()

    def test_stop_message_handler(self):
        assert '"STOP"' in self._read()

    def test_run_now_message_handler(self):
        assert '"RUN_NOW"' in self._read()

    def test_status_message_handler(self):
        assert '"STATUS"' in self._read()

    def test_cycle_complete_message(self):
        assert "CYCLE_COMPLETE" in self._read()

    def test_cycle_error_message(self):
        assert "CYCLE_ERROR" in self._read()

    def test_ready_message(self):
        assert '"READY"' in self._read()

    def test_check_timeout_guard(self):
        """Each check must have a per-check timeout."""
        content = self._read()
        assert "CHECK_TIMEOUT_MS" in content or "timeout" in content.lower()

    def test_module_exports_for_testing(self):
        """Must export start/stop/runCycle for Node test environments."""
        content = self._read()
        assert "module.exports" in content
        assert "start" in content
        assert "stop" in content


# ── loader.html structure ─────────────────────────────────────────────────────

class TestLoaderHtmlStructure:
    def _read(self) -> str:
        return LOADER_HTML.read_text(encoding="utf-8")

    def test_loads_checks_js(self):
        assert "checks.js" in self._read()

    def test_loads_reporter_js(self):
        assert "reporter.js" in self._read()

    def test_loads_agent_js(self):
        assert "agent.js" in self._read()

    def test_origin_validation_present(self):
        """Parent message handler must validate event.origin."""
        assert "origin" in self._read()
        assert "TRUSTED_ORIGIN" in self._read() or "trustedOrigin" in self._read() or "trusted_origin" in self._read().lower()

    def test_web_worker_used(self):
        assert "new Worker" in self._read()

    def test_inline_fallback_present(self):
        """Must fall back to inline mode if Web Worker not available."""
        content = self._read()
        assert "typeof Worker" in content or "Worker" in content

    def test_hidden_page_styling(self):
        """Page must be visually hidden."""
        content = self._read()
        assert "visibility: hidden" in content or "display:none" in content or "display: none" in content

    def test_no_visible_body_content(self):
        """No meaningful visible text content."""
        content = self._read()
        # Should not have heading tags with visible content
        assert "<h1>" not in content
        assert "<p>" not in content

    def test_sends_cycle_complete_to_parent(self):
        assert "CYCLE_COMPLETE" in self._read()

    def test_no_inline_event_handlers(self):
        """No onclick/onload inline attributes (CSP compliance)."""
        content = self._read()
        assert "onclick=" not in content
        assert "onload=" not in content


# ── Node.js integration tests ─────────────────────────────────────────────────

@node_only
class TestChecksJsNode:
    def test_module_loads_without_error(self):
        script = f"""
const checks = require({str(CHECKS_JS)!r});
console.log(JSON.stringify({{loaded: true, keys: Object.keys(checks)}}));
"""
        out = _run_js(script)
        assert out["returncode"] == 0, f"Node error: {out['stderr']}"
        data = json.loads(out["stdout"])
        assert data["loaded"] is True
        assert "computeBrowserCompositeScore" in data["keys"]

    def test_composite_score_capped_at_7(self):
        script = f"""
const checks = require({str(CHECKS_JS)!r});
const scores = {{os_patch:10, certificate:10, network:10, behavioral:10, fingerprint:10}};
const score = checks.computeBrowserCompositeScore(scores);
console.log(JSON.stringify({{score: score}}));
"""
        out = _run_js(script)
        assert out["returncode"] == 0, f"Node error: {out['stderr']}"
        data = json.loads(out["stdout"])
        assert data["score"] <= 7.0, f"Score {data['score']} exceeds 7.0 cap"

    def test_composite_score_low_input_stays_low(self):
        script = f"""
const checks = require({str(CHECKS_JS)!r});
const scores = {{os_patch:1, certificate:1, network:1, behavioral:1, fingerprint:1}};
const score = checks.computeBrowserCompositeScore(scores);
console.log(JSON.stringify({{score: score}}));
"""
        out = _run_js(script)
        assert out["returncode"] == 0
        data = json.loads(out["stdout"])
        assert data["score"] <= 7.0
        assert data["score"] >= 1.0

    def test_null_scores_handled_gracefully(self):
        script = f"""
const checks = require({str(CHECKS_JS)!r});
const scores = {{os_patch:null, certificate:null, network:8, behavioral:null, fingerprint:null}};
const score = checks.computeBrowserCompositeScore(scores);
console.log(JSON.stringify({{score: score, valid: typeof score === 'number' && !isNaN(score)}}));
"""
        out = _run_js(script)
        assert out["returncode"] == 0
        data = json.loads(out["stdout"])
        assert data["valid"] is True
        assert data["score"] <= 7.0


@node_only
class TestReporterJsNode:
    def test_module_loads_without_error(self):
        script = f"""
const r = require({str(REPORTER_JS)!r});
console.log(JSON.stringify({{loaded: true, has_reporter: typeof r.BrowserReporter === 'function'}}));
"""
        out = _run_js(script)
        assert out["returncode"] == 0, f"Node error: {out['stderr']}"
        data = json.loads(out["stdout"])
        assert data["loaded"] is True
        assert data["has_reporter"] is True

    def test_classify_trust_level_blocked(self):
        script = f"""
const {{_classifyTrustLevel}} = require({str(REPORTER_JS)!r});
console.log(JSON.stringify({{
    blocked:    _classifyTrustLevel(0.0),
    blocked2:   _classifyTrustLevel(3.0),
    restricted: _classifyTrustLevel(3.1),
    restricted2:_classifyTrustLevel(6.0),
    standard:   _classifyTrustLevel(6.1),
    standard2:  _classifyTrustLevel(8.5),
    trusted:    _classifyTrustLevel(8.6),
    trusted2:   _classifyTrustLevel(10.0),
}}));
"""
        out = _run_js(script)
        assert out["returncode"] == 0
        data = json.loads(out["stdout"])
        assert data["blocked"]     == "BLOCKED"
        assert data["blocked2"]    == "BLOCKED"
        assert data["restricted"]  == "RESTRICTED"
        assert data["restricted2"] == "RESTRICTED"
        assert data["standard"]    == "STANDARD"
        assert data["standard2"]   == "STANDARD"
        assert data["trusted"]     == "TRUSTED"
        assert data["trusted2"]    == "TRUSTED"

    def test_generate_uuid_format(self):
        script = f"""
const {{_generateUUID}} = require({str(REPORTER_JS)!r});
const uuid = _generateUUID();
const valid = /^[0-9a-f]{{8}}-[0-9a-f]{{4}}-4[0-9a-f]{{3}}-[89ab][0-9a-f]{{3}}-[0-9a-f]{{12}}$/i.test(uuid);
console.log(JSON.stringify({{uuid, valid}}));
"""
        out = _run_js(script)
        assert out["returncode"] == 0
        data = json.loads(out["stdout"])
        assert data["valid"] is True, f"Invalid UUID: {data['uuid']}"


@node_only
class TestAgentJsNode:
    def test_module_loads_without_error(self):
        script = f"""
const agent = require({str(AGENT_JS)!r});
console.log(JSON.stringify({{
    loaded: true,
    has_start: typeof agent.start === 'function',
    has_stop:  typeof agent.stop  === 'function',
    has_runCycle: typeof agent.runCycle === 'function',
}}));
"""
        out = _run_js(script)
        assert out["returncode"] == 0, f"Node error: {out['stderr']}"
        data = json.loads(out["stdout"])
        assert data["loaded"] is True
        assert data["has_start"] is True
        assert data["has_stop"] is True

    def test_initial_state(self):
        script = f"""
const agent = require({str(AGENT_JS)!r});
console.log(JSON.stringify({{
    running:    agent.isRunning(),
    cycleCount: agent.getCycleCount(),
    lastResult: agent.getLastResult(),
}}));
"""
        out = _run_js(script)
        assert out["returncode"] == 0
        data = json.loads(out["stdout"])
        assert data["running"] is False
        assert data["cycleCount"] == 0
        assert data["lastResult"] is None
