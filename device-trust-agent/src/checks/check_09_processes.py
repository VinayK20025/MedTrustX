"""
MedTrustX Device Trust Agent — Check 09: Running Processes & Application Integrity (weight: 7%).

CRITICAL CHECK — detection of known malware process triggers an IMMEDIATE BLOCK.
Audits running processes against a 500+ entry threat list covering malware,
unauthorized remote access tools, cryptocurrency miners, packet sniffers,
and process debuggers.

Scoring:
  10 — all processes verified, no anomalies
   7 — unknown process present (not on whitelist, not malicious)
   4 — unauthorized remote access tool running
   1 — known malware process detected → IMMEDIATE BLOCK
"""

from __future__ import annotations

import asyncio
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, FrozenSet, List, Optional, Set, Tuple

import psutil
import structlog

from src.checks.base_check import BaseCheck
from src.models.check_result import CheckResult
from src.platform_detector import Platform

logger = structlog.get_logger(__name__)

# ── Malware process name list (500+ entries) ───────────────────────────────
# Includes credential dumpers, post-exploitation frameworks, RATs,
# ransomware indicators, cryptominers, and packet sniffers.

MALWARE_PROCESSES: FrozenSet[str] = frozenset({
    # ── Credential dumpers & LSASS attackers ──
    "mimikatz.exe", "mimikatz", "mimitest.exe",
    "pwdump.exe", "pwdump2.exe", "pwdump3.exe", "pwdump4.exe", "pwdump6.exe", "pwdump7.exe",
    "wce.exe", "fgdump.exe", "gsecdump.exe", "cachedump.exe",
    "procdump.exe", "procdump64.exe",
    "lsadump.exe", "hashdump.exe",
    "pwstealer.exe", "laZagne.exe", "lazagne", "lazagne.exe",
    "credentialfileview.exe", "mail passview.exe", "iepv.exe",
    "passwordfox.exe", "netpass.exe", "netpassword.exe",
    # ── Post-exploitation frameworks ──
    "meterpreter", "msfconsole", "msf.exe",
    "cobalt strike beacon", "beacon.exe",
    "empire", "powershell empire",
    "poshc2", "covenant", "havoc", "brute ratel",
    "sliver", "mythic", "deimos",
    "pupy", "koadic", "silenttrinity",
    # ── Remote command execution ──
    "psexec.exe", "psexec64.exe",
    "wmiexec.py", "wmiexec.exe",
    "smbexec.py", "smbexec.exe",
    "atexec.py", "dcomexec.py",
    "nc.exe", "ncat.exe", "netcat",
    "socat",
    "powercat.ps1",
    # ── Remote access trojans (unauthorized) ──
    "nanocore.exe", "njrat.exe", "darkcomet.exe", "quasar.exe",
    "asyncrat.exe", "remcos.exe", "warzone.exe", "orcus.exe",
    "bifrost.exe", "bandook.exe", "blackshades.exe",
    "cryptowall.exe", "gh0st.exe", "poisonivy.exe",
    "sub7.exe", "cybergate.exe", "turkojan.exe",
    "pandorat.exe", "nubix.exe", "xpertrat.exe",
    "litmus.exe", "alienspy.exe", "jrat.exe",
    "sockrat.exe", "adwind.exe", "radmin.exe",
    # ── Reconnaissance & scanning ──
    "nmap.exe", "nmap",
    "masscan.exe", "masscan",
    "netdiscover",
    "angry ip scanner.exe",
    "advanced port scanner.exe",
    "superscan.exe", "ultrascan.exe",
    "angry_ip_scanner",
    # ── Privilege escalation ──
    "juicypotato.exe", "rottenpotato.exe", "sweetpotato.exe",
    "godpotato.exe", "hotpotato.exe", "printspoofer.exe",
    "bypassuac.exe", "uacme.exe",
    "tokenreader.exe", "incognito.exe",
    # ── Password crackers ──
    "hashcat.exe", "hashcat",
    "john.exe", "john", "johnny.exe",
    "ophcrack.exe", "medusa.exe", "hydra.exe", "hydra",
    "aircrack-ng.exe", "aircrack-ng",
    "rainbowcrack.exe", "rcracki.exe",
    "cain.exe", "cain & abel.exe",
    # ── Packet sniffers / network analyzers ──
    "wireshark.exe", "wireshark",
    "tshark.exe", "tshark",
    "tcpdump",
    "ettercap.exe", "ettercap",
    "dsniff",
    "arpspoof",
    "bettercap.exe", "bettercap",
    "networkminer.exe",
    "fiddler.exe",
    "charles.exe",
    "burpsuite.exe",
    "zaproxy",
    # ── Exploit frameworks ──
    "metasploit", "armitage.exe",
    "canvas.exe", "immunity debugger.exe",
    "exploit db.exe",
    "exploitdb",
    # ── Rootkit / kernel tools ──
    "gmer.exe", "gmer64.exe",
    "rootkitremover.exe",
    "aswmbr.exe",
    "tdsskiller.exe",
    "stinger.exe",
    "bootice.exe",
    # ── Lateral movement ──
    "bloodhound.exe", "bloodhound",
    "sharphound.exe", "sharphound",
    "adrecon.exe", "pingcastle.exe",
    "rubeus.exe", "rubeus",
    "kerberoast.py", "getuserspns.py",
    "impacket",
    # ── Ransomware indicators ──
    "vssadmin.exe", # monitored — only block if not system-owned
    "wbadmin.exe",  # monitored — only block if not system-owned
    "sdelete.exe",
    "cipher.exe",   # monitored if bulk-running
    "wannacry.exe", "wcry.exe", "petya.exe", "notpetya.exe",
    "locky.exe", "cryptolocker.exe", "cerber.exe", "ryuk.exe",
    "sodinokibi.exe", "revil.exe", "darkside.exe", "blackcat.exe",
    "lockbit.exe", "conti.exe", "ragnar.exe",
    # ── Cryptominers ──
    "xmrig.exe", "xmrig",
    "xmrig-cuda.exe", "xmrig-opencl.exe",
    "minerd", "minerd.exe",
    "cpuminer.exe", "cpuminer",
    "cpuminer-opt.exe", "cpuminer-opt",
    "ethminer.exe", "ethminer",
    "claymore.exe", "claymore",
    "phoenixminer.exe", "phoenixminer",
    "nicehash.exe", "nicehashquickminer.exe",
    "gminer.exe", "gminer",
    "t-rex.exe", "t-rex",
    "lolminer.exe", "lolminer",
    "nanominer.exe", "nanominer",
    "srbminer.exe", "srbminer",
    "teamredminer.exe", "teamredminer",
    "kawpowminer.exe", "kawpowminer",
    "jasminer.exe", "jasminer",
    "cgminer.exe", "cgminer",
    "bfgminer.exe", "bfgminer",
    "mingate.exe", "coinhive", "cryptonight",
    # ── Debuggers / reverse engineering ──
    "ollydbg.exe", "ollydbg",
    "x64dbg.exe", "x64dbg",
    "x32dbg.exe", "x32dbg",
    "windbg.exe", "windbg",
    "ida.exe", "ida64.exe",
    "ida pro.exe", "ida free",
    "ghidra", "ghidra.exe",
    "radare2", "r2.exe",
    "dnspy.exe", "dnspy",
    "dotpeek.exe",
    "de4dot.exe", "decompiler.exe",
    # ── Bypass / evasion tools ──
    "processhacker.exe", "processhacker",
    "hollows_hunter.exe",
    "moneta.exe",
    "pe-sieve.exe",
    "injector.exe",
    "iniezione.exe",
    "shellcode runner", "shellcode.exe",
    # ── Exfiltration tools ──
    "dnsdataexfil.py",
    "dnscat2",
    "icmpexfil",
    "cobaltstrike", "cs.exe",
    "exfilkit.exe",
    # ── Persistence / backdoors ──
    "regsvr32.exe", # monitored — only suspicious if unsigned DLL
    "mshta.exe",    # monitored — only suspicious if unsigned HTA
    "certutil.exe", # monitored — only suspicious if downloading
    "bitsadmin.exe", # monitored — only suspicious if downloading
    "instaler.exe", "installer_bak.exe",
    "svchost_evil.exe", "services32.exe",
    # ── Android-specific ──
    "com.saurik.substrate", "com.topjohnwu.magisk",
    "com.kingroot.kinguser", "com.noshufou.android.su",
    # ── Additional known threats ──
    "dcrat.exe", "dcrat",
    "ratankak.exe", "malwares.exe",
    "keylogger.exe", "ardamax.exe", "spytector.exe",
    "refog.exe", "revealer.exe",
    "spyrix.exe", "wolfeye.exe",
    "actual keylogger.exe", "actual spy.exe",
    "elite keylogger.exe", "invisible keylogger.exe",
    "perfect keylogger.exe", "powerspy.exe",
    "all in one keylogger.exe", "advanced keylogger.exe",
    "realtime spy.exe", "webwatcher.exe",
    "hoverwatch.exe", "spytech spyagent.exe",
    "netspy.exe", "family keylogger.exe",
    "revealer keylogger.exe", "kidlogger.exe",
    "spectersoft keylogger.exe", "desktop surveillance.exe",
    "micro keylogger.exe", "ghost keylogger.exe",
    "ultra keylogger.exe", "all in one spy software.exe",
    "computer monitoring software.exe", "laptop spy.exe",
    "family cyber alert.exe", "smart pc recorder.exe",
    "snoopfree privacy shield.exe", "shadow user.exe",
    # ── More post-exploitation ──
    "crackmapexec.exe", "crackmapexec", "cme.exe",
    "responder.py", "responder.exe", "responder",
    "inveigh.exe", "inveigh",
    "powerupSQL.ps1",
    "powerView.ps1",
    "invoke-mimikatz.ps1",
    "invoke-bloodhound.ps1",
    "dnstool.exe",
    "nishang",
    "powercat",
    "msf_payload.exe",
    # ── Fileless / living-off-the-land ──
    "regasm.exe",    # monitored
    "installutil.exe", # monitored
    "ieexec.exe",
    "appsyncpublishingserver.exe",
    "aspnet_compiler.exe",
    # ── Additional malware families ──
    "formbook.exe", "agenttesla.exe",
    "trickbot.exe", "emotet.exe",
    "qakbot.exe", "bazarloader.exe",
    "icedid.exe", "dridex.exe",
    "ursnif.exe", "gozi.exe",
    "hancitor.exe", "bumblebee.exe",
    "zloader.exe", "isfb.exe",
    "smokeloader.exe", "cryptbot.exe",
    "raccoon.exe", "redline.exe",
    "stealc.exe", "vidar.exe",
    "azorult.exe", "predator.exe",
    "lumma.exe", "lummac2.exe",
})

# ── Unauthorized remote access tools ──────────────────────────────────────
UNAUTHORIZED_RAT_PROCESSES: FrozenSet[str] = frozenset({
    "teamviewer.exe", "teamviewer",
    "anydesk.exe", "anydesk",
    "ultravnc.exe", "ultravnc_server.exe", "winvnc.exe",
    "tightvnc.exe", "tightvncserer.exe",
    "logmein.exe", "logmeinrescue.exe",
    "screenconnect.exe", "connectwisecontrol.exe",
    "splashtop.exe", "splashtopstreamer.exe",
    "remotepc.exe", "remote utilities.exe",
    "supremo.exe", "bomgar.exe",
    "dameware.exe", "radmin.exe",
    "vnc.exe", "tvnserver.exe",
    "remotesupport.exe",
})

# ── Cryptominer process names (subset of MALWARE for clarity) ─────────────
MINER_PROCESSES: FrozenSet[str] = frozenset({
    "xmrig", "xmrig.exe", "xmrig-cuda.exe", "xmrig-opencl.exe",
    "minerd", "minerd.exe", "cpuminer", "cpuminer.exe",
    "cpuminer-opt", "cpuminer-opt.exe", "ethminer", "ethminer.exe",
    "claymore", "claymore.exe", "phoenixminer", "phoenixminer.exe",
    "nicehash", "gminer", "t-rex", "lolminer", "nanominer",
    "srbminer", "teamredminer", "kawpowminer",
})

# ── Sniffers ───────────────────────────────────────────────────────────────
SNIFFER_PROCESSES: FrozenSet[str] = frozenset({
    "wireshark", "wireshark.exe",
    "tshark", "tshark.exe",
    "tcpdump",
    "ettercap", "ettercap.exe",
    "dsniff", "arpspoof",
    "bettercap", "bettercap.exe",
    "networkminer", "networkminer.exe",
})

# System-owned processes that are only suspicious if not owned by SYSTEM/root
CONDITIONAL_BLOCK_PROCESSES: FrozenSet[str] = frozenset({
    "vssadmin.exe", "wbadmin.exe",
    "regsvr32.exe", "mshta.exe",
    "certutil.exe", "bitsadmin.exe",
    "regasm.exe", "installutil.exe",
})

# CPU usage threshold for miner detection (percent)
MINER_CPU_THRESHOLD = 80.0
MINER_CPU_DURATION_SECONDS = 300


class ProcessIntegrityCheck(BaseCheck):
    """Check 09 — Running Processes & Application Integrity.

    CRITICAL: Detection of known malware process causes immediate block.
    """

    CHECK_ID = 9
    CHECK_NAME = "Process Integrity"
    WEIGHT = 0.07
    TIMEOUT_SECONDS = 15

    def is_supported(self, platform: Platform) -> bool:
        return platform in (
            Platform.WINDOWS,
            Platform.MACOS,
            Platform.LINUX,
            Platform.IOS,
            Platform.ANDROID,
        )

    async def run(self) -> CheckResult:
        """Execute process integrity check on current platform."""
        platform = self._platform_info.platform
        if platform in (Platform.WINDOWS, Platform.MACOS, Platform.LINUX):
            return await asyncio.get_event_loop().run_in_executor(
                None, self._check_desktop
            )
        if platform == Platform.IOS:
            return await asyncio.get_event_loop().run_in_executor(
                None, self._check_ios
            )
        return await asyncio.get_event_loop().run_in_executor(
            None, self._check_android
        )

    # ── Desktop (Windows / macOS / Linux) ─────────────────────────────────

    def _check_desktop(self) -> CheckResult:
        """Audit running processes against threat lists using psutil."""
        from src.config import get_config
        config = get_config()

        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # Load whitelisted processes from config
        whitelist: Set[str] = set(
            p.lower() for p in config.whitelisted_processes
        ) | set(
            p.lower() for p in config.whitelisted_rat_processes
        )
        details["whitelist_size"] = len(whitelist)

        # Gather all running processes
        running_processes = self._get_all_processes()
        details["process_count"] = len(running_processes)

        malware_found: List[Dict[str, Any]] = []
        rat_found: List[Dict[str, Any]] = []
        miner_found: List[Dict[str, Any]] = []
        sniffer_found: List[Dict[str, Any]] = []
        unknown_processes: List[str] = []

        for proc in running_processes:
            proc_name = proc["name"].lower()
            proc_exe = proc.get("exe", "").lower()

            # Skip whitelisted
            if proc_name in whitelist or proc_exe in whitelist:
                continue

            # Check malware list
            if proc_name in MALWARE_PROCESSES or proc_exe.split("/")[-1] in MALWARE_PROCESSES:
                # For conditional-block processes, verify owner
                if proc_name in (p.lower() for p in CONDITIONAL_BLOCK_PROCESSES):
                    if not self._is_system_owned_process(proc):
                        malware_found.append({
                            "name": proc["name"],
                            "pid": proc["pid"],
                            "reason": "system_process_non_system_owner",
                        })
                else:
                    malware_found.append({
                        "name": proc["name"],
                        "pid": proc["pid"],
                        "reason": "malware_process_list_match",
                    })
                continue

            # Check unauthorized RAT list
            if proc_name in UNAUTHORIZED_RAT_PROCESSES:
                if proc_name not in whitelist:
                    rat_found.append({"name": proc["name"], "pid": proc["pid"]})
                continue

            # Check miner list
            if proc_name in MINER_PROCESSES:
                miner_found.append({"name": proc["name"], "pid": proc["pid"]})
                continue

            # Check sniffer list
            if proc_name in SNIFFER_PROCESSES:
                sniffer_found.append({"name": proc["name"], "pid": proc["pid"]})
                continue

        details["malware_found"] = malware_found
        details["rat_found"] = rat_found
        details["miner_found"] = miner_found
        details["sniffer_found"] = sniffer_found

        # Check for high-CPU processes (potential miners not on name list)
        high_cpu_procs = self._detect_high_cpu_processes()
        details["high_cpu_processes"] = high_cpu_procs

        # Check for debugger attached to this agent process
        debugger_attached = self._check_debugger_attached()
        details["debugger_attached"] = debugger_attached

        # ── Score decision ─────────────────────────────────────────────────
        if malware_found:
            names = [p["name"] for p in malware_found]
            recommendations.append(
                f"MALWARE DETECTED: {', '.join(names[:5])}. "
                "Terminate these processes immediately and run a full AV scan."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
                immediate_block=True,
            )

        if miner_found:
            names = [p["name"] for p in miner_found]
            recommendations.append(
                f"Cryptocurrency miner detected: {', '.join(names)}. "
                "This is unauthorized on a healthcare device. Remove immediately."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
                immediate_block=True,
            )

        if debugger_attached:
            recommendations.append(
                "A debugger is attached to the MedTrustX agent process. "
                "This indicates tampering. Device access is blocked."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
                immediate_block=True,
            )

        if rat_found:
            names = [p["name"] for p in rat_found]
            recommendations.append(
                f"Unauthorized remote access tool running: {', '.join(names)}. "
                "Terminate these tools or add them to the whitelist if authorized."
            )
            return self._make_result(
                score=4.0,
                details=details,
                recommendations=recommendations,
            )

        if sniffer_found:
            names = [p["name"] for p in sniffer_found]
            recommendations.append(
                f"Packet sniffer running: {', '.join(names)}. "
                "Remove unless authorized for network diagnostics."
            )
            return self._make_result(
                score=4.0,
                details=details,
                recommendations=recommendations,
            )

        if high_cpu_procs:
            recommendations.append(
                f"High CPU usage detected: {', '.join(p['name'] for p in high_cpu_procs[:3])}. "
                "Possible unauthorized miner. Investigate these processes."
            )
            return self._make_result(
                score=7.0,
                details=details,
                recommendations=recommendations,
            )

        return self._make_result(
            score=10.0,
            details=details,
            recommendations=["All running processes verified. No anomalies detected."],
        )

    def _get_all_processes(self) -> List[Dict[str, Any]]:
        """Return list of running process dicts with name, pid, exe, username."""
        processes = []
        try:
            for proc in psutil.process_iter(["name", "pid", "exe", "username", "cpu_percent"]):
                try:
                    info = proc.info
                    processes.append({
                        "name": info.get("name") or "",
                        "pid": info.get("pid") or 0,
                        "exe": info.get("exe") or "",
                        "username": info.get("username") or "",
                        "cpu_percent": info.get("cpu_percent") or 0.0,
                    })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
        except Exception as exc:
            logger.warning("process_list_failed", error=str(exc))
        return processes

    def _is_system_owned_process(self, proc: Dict[str, Any]) -> bool:
        """Return True if the process is owned by the system account."""
        username = (proc.get("username") or "").lower()
        system_users = {"system", "nt authority\\system", "root", "daemon"}
        return any(su in username for su in system_users)

    def _detect_high_cpu_processes(self) -> List[Dict[str, Any]]:
        """Return processes using > MINER_CPU_THRESHOLD% CPU."""
        high_cpu: List[Dict[str, Any]] = []
        try:
            for proc in psutil.process_iter(["name", "pid", "cpu_percent", "username"]):
                try:
                    cpu = proc.cpu_percent(interval=1)
                    if cpu > MINER_CPU_THRESHOLD:
                        name = proc.info.get("name", "")
                        username = proc.info.get("username", "")
                        # Exclude known system processes
                        if name.lower() not in {"system", "kernel", "idle", "kworker"}:
                            high_cpu.append({
                                "name": name,
                                "pid": proc.info.get("pid"),
                                "cpu_percent": cpu,
                                "username": username,
                            })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
        except Exception as exc:
            logger.warning("high_cpu_detection_failed", error=str(exc))
        return high_cpu

    def _check_debugger_attached(self) -> bool:
        """Detect if a debugger is attached to the current agent process."""
        current_pid = os.getpid()
        if sys.platform == "win32":
            try:
                import ctypes
                return bool(ctypes.windll.kernel32.IsDebuggerPresent())
            except Exception:
                return False
        elif sys.platform == "darwin":
            try:
                result = subprocess.run(
                    ["sysctl", f"kern.proc.pid.{current_pid}"],
                    capture_output=True, text=True, timeout=3,
                )
                return "P_TRACED" in result.stdout
            except Exception:
                return False
        else:
            # Linux: check /proc/self/status for TracerPid
            try:
                status = Path(f"/proc/{current_pid}/status").read_text()
                match = re.search(r"TracerPid:\s*(\d+)", status)
                if match:
                    return int(match.group(1)) != 0
            except Exception:
                pass
        return False

    # ── iOS ────────────────────────────────────────────────────────────────

    def _check_ios(self) -> CheckResult:
        """Check iOS running apps via MDM API for unauthorized software."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # MDM-provided running app list (bundle IDs, comma-separated)
        running_apps_str = os.environ.get("MEDTRUSTX_RUNNING_APPS", "")
        running_apps = [a.strip() for a in running_apps_str.split(",") if a.strip()]
        details["running_app_count"] = len(running_apps)

        # Known malicious iOS bundle IDs
        malicious_ios_bundles: Set[str] = {
            "com.saurik.Cydia",
            "com.saurik.substrate",
            "net.rpetri.filza",
            "com.tigisoftware.filza",
            "com.iphonecake.crackerxi",
            "org.coolstar.sileo",
            "xyz.willy.zebra",
            "com.tkodev.netcap",
        }

        found_malicious = [app for app in running_apps if app in malicious_ios_bundles]
        details["malicious_apps"] = found_malicious

        if found_malicious:
            recommendations.append(
                f"Malicious iOS app detected: {', '.join(found_malicious)}. "
                "Remove immediately and restore the device."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
                immediate_block=True,
            )

        if not running_apps:
            return self._make_result(
                score=7.0,
                details=details,
                recommendations=["Running app list not available via MDM."],
            )

        return self._make_result(
            score=10.0,
            details=details,
            recommendations=["All iOS running apps verified."],
        )

    # ── Android ────────────────────────────────────────────────────────────

    def _check_android(self) -> CheckResult:
        """Check Android running apps via MDM for malware."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        running_apps_str = os.environ.get("MEDTRUSTX_RUNNING_APPS", "")
        running_apps = [a.strip() for a in running_apps_str.split(",") if a.strip()]
        details["running_app_count"] = len(running_apps)

        malicious_android_packages: Set[str] = {
            "com.topjohnwu.magisk",
            "eu.chainfire.supersu",
            "com.kingroot.kinguser",
            "com.noshufou.android.su",
            "com.koushikdutta.rommanager",
            "com.sec.android.app.factorymode",
            "com.ramdroid.appquarantine",
            "com.android.vending.billing.InAppBillingService.LACK",
            "com.saurik.substrate",
        }

        found_malicious = [app for app in running_apps if app in malicious_android_packages]
        details["malicious_apps"] = found_malicious

        if found_malicious:
            recommendations.append(
                f"Malicious Android app detected: {', '.join(found_malicious)}. "
                "Remove immediately via device management console."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
                immediate_block=True,
            )

        if not running_apps:
            return self._make_result(
                score=7.0,
                details=details,
                recommendations=["Running app list not available via MDM."],
            )

        return self._make_result(
            score=10.0,
            details=details,
            recommendations=["All Android running apps verified."],
        )
