#!/usr/bin/env bash
# MedTrustX Device Trust Agent — macOS Installer
#
# Installs the agent binary, config, and LaunchDaemon plist, then
# loads it via launchctl so it starts immediately and on every boot.
#
# Prerequisites:
#   - Run as root (sudo ./install.sh)
#   - macOS 12 (Monterey) or later
#   - medtrustx-agent binary in the same directory as this script
#     OR set $AGENT_BINARY_PATH
#
# Usage:
#   sudo ./install.sh [install|uninstall|start|stop|status|restart]
#
# Environment variables:
#   AGENT_BINARY_PATH  — path to medtrustx-agent binary
#                        (default: <script dir>/medtrustx-agent)
#   AGENT_INSTALL_DIR  — installation directory
#                        (default: /usr/local/bin)
#   AGENT_CONFIG_DIR   — config directory
#                        (default: /etc/medtrustx)
#   AGENT_LOG_DIR      — log directory
#                        (default: /var/log/medtrustx)
#   AGENT_ENV_FILE     — source .env config file (optional)
#                        (default: <script dir>/agent.env)

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BINARY_SRC="${AGENT_BINARY_PATH:-$SCRIPT_DIR/medtrustx-agent}"
INSTALL_DIR="${AGENT_INSTALL_DIR:-/usr/local/bin}"
CONFIG_DIR="${AGENT_CONFIG_DIR:-/etc/medtrustx}"
LOG_DIR="${AGENT_LOG_DIR:-/var/log/medtrustx}"
ENV_SRC="${AGENT_ENV_FILE:-$SCRIPT_DIR/agent.env}"

BINARY_DST="$INSTALL_DIR/medtrustx-agent"
CONFIG_DST="$CONFIG_DIR/agent.env"
PLIST_NAME="com.medtrustx.agent"
PLIST_DST="/Library/LaunchDaemons/${PLIST_NAME}.plist"
PLIST_SRC="$SCRIPT_DIR/${PLIST_NAME}.plist"

COMMAND="${1:-install}"

# ── Helpers ───────────────────────────────────────────────────────────────────

cyan()  { printf '\033[1;36m%s\033[0m\n' "$*"; }
green() { printf '\033[1;32m[OK] %s\033[0m\n' "$*"; }
warn()  { printf '\033[1;33m[WARN] %s\033[0m\n' "$*" >&2; }
die()   { printf '\033[1;31m[FAIL] %s\033[0m\n' "$*" >&2; exit 1; }
step()  { echo; cyan "[MedTrustX Install] $*"; }

require_root() {
    [[ "$(id -u)" -eq 0 ]] || die "This script must be run as root (use sudo)."
}

require_macos() {
    [[ "$(uname -s)" == "Darwin" ]] || die "This installer is for macOS only."
}

macos_version_ok() {
    local version
    version=$(sw_vers -productVersion)
    local major
    major=$(echo "$version" | cut -d. -f1)
    [[ "$major" -ge 12 ]] || die "macOS 12 (Monterey) or later required. Found: $version"
}

# ── Install ───────────────────────────────────────────────────────────────────

do_install() {
    require_root
    require_macos
    macos_version_ok

    step "Checking prerequisites"
    [[ -f "$BINARY_SRC" ]] \
        || die "Binary not found: $BINARY_SRC\nSet AGENT_BINARY_PATH or copy medtrustx-agent next to this script."
    green "Binary: $BINARY_SRC"

    # If already loaded, unload first
    if launchctl list 2>/dev/null | grep -q "$PLIST_NAME"; then
        warn "Daemon already loaded — unloading before reinstall"
        launchctl bootout system "$PLIST_DST" 2>/dev/null || true
    fi

    step "Creating directories"
    install -d -m 755 "$INSTALL_DIR"
    install -d -m 750 "$CONFIG_DIR"
    install -d -m 750 "$LOG_DIR"
    green "Directories created"

    step "Installing binary"
    install -m 755 "$BINARY_SRC" "$BINARY_DST"
    # Remove quarantine attribute (required for notarized but locally-installed binaries)
    xattr -d com.apple.quarantine "$BINARY_DST" 2>/dev/null || true
    green "Installed: $BINARY_DST"

    step "Installing configuration"
    if [[ -f "$ENV_SRC" ]]; then
        install -m 640 "$ENV_SRC" "$CONFIG_DST"
        chown root:wheel "$CONFIG_DST"
        green "Config: $CONFIG_DST"
    else
        warn "No agent.env found at $ENV_SRC — agent will use environment variables / defaults"
        touch "$CONFIG_DST"
        chmod 640 "$CONFIG_DST"
        chown root:wheel "$CONFIG_DST"
    fi

    step "Installing LaunchDaemon plist"
    if [[ -f "$PLIST_SRC" ]]; then
        install -m 644 "$PLIST_SRC" "$PLIST_DST"
        chown root:wheel "$PLIST_DST"
        green "Plist: $PLIST_DST"
    else
        # Generate plist inline if not present alongside installer
        cat > "$PLIST_DST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.medtrustx.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>${BINARY_DST}</string>
        <string>run</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>MEDTRUSTX_ENV_FILE</key>
        <string>${CONFIG_DST}</string>
        <key>AGENT_LOG_FILE_PATH</key>
        <string>${LOG_DIR}/agent.log</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${LOG_DIR}/agent.stdout.log</string>
    <key>StandardErrorPath</key>
    <string>${LOG_DIR}/agent.stderr.log</string>
    <key>ProcessType</key>
    <string>Background</string>
    <key>LimitLoadToSessionType</key>
    <string>System</string>
</dict>
</plist>
PLIST
        chmod 644 "$PLIST_DST"
        chown root:wheel "$PLIST_DST"
        green "Generated plist: $PLIST_DST"
    fi

    # Validate plist syntax
    plutil -lint "$PLIST_DST" \
        && green "Plist syntax OK" \
        || warn "Plist lint failed — check $PLIST_DST"

    step "Loading LaunchDaemon"
    launchctl bootstrap system "$PLIST_DST"
    sleep 1
    if launchctl list 2>/dev/null | grep -q "$PLIST_NAME"; then
        green "Daemon running: $PLIST_NAME"
    else
        warn "Daemon may not have started — check: launchctl list | grep medtrustx"
    fi

    echo
    cyan "════════════════════════════════════════════════"
    green "Installation complete!"
    echo "  Binary : $BINARY_DST"
    echo "  Config : $CONFIG_DST"
    echo "  Logs   : $LOG_DIR"
    echo "  Plist  : $PLIST_DST"
    echo
    echo "  Status : sudo launchctl list com.medtrustx.agent"
    echo "  Logs   : tail -f $LOG_DIR/agent.log"
    cyan "════════════════════════════════════════════════"
}

# ── Uninstall ─────────────────────────────────────────────────────────────────

do_uninstall() {
    require_root

    step "Stopping and unloading daemon"
    if [[ -f "$PLIST_DST" ]]; then
        launchctl bootout system "$PLIST_DST" 2>/dev/null || true
        green "Daemon unloaded"
    else
        warn "Plist not found at $PLIST_DST — skipping bootout"
    fi

    step "Removing files"
    local removed=0
    for f in "$PLIST_DST" "$BINARY_DST"; do
        if [[ -f "$f" ]]; then
            rm -f "$f"
            green "Removed: $f"
            ((removed++)) || true
        fi
    done

    # Keep config and logs for audit trail
    warn "Config directory preserved: $CONFIG_DIR"
    warn "Log directory preserved:    $LOG_DIR"
    warn "Remove manually if desired: sudo rm -rf $CONFIG_DIR $LOG_DIR"

    [[ "$removed" -gt 0 ]] && green "Uninstall complete" || warn "Nothing to remove"
}

# ── Start / Stop ──────────────────────────────────────────────────────────────

do_start() {
    require_root
    [[ -f "$PLIST_DST" ]] || die "Daemon not installed. Run: sudo ./install.sh install"
    launchctl bootstrap system "$PLIST_DST" 2>/dev/null \
        || launchctl kickstart system/"$PLIST_NAME"
    green "Daemon started"
}

do_stop() {
    require_root
    launchctl bootout system "$PLIST_DST" 2>/dev/null \
        || launchctl kill TERM system/"$PLIST_NAME" 2>/dev/null \
        || warn "Daemon may not be running"
    green "Daemon stopped"
}

do_status() {
    local entry
    entry=$(launchctl list 2>/dev/null | grep "$PLIST_NAME" || true)
    if [[ -n "$entry" ]]; then
        local pid status
        pid=$(echo "$entry" | awk '{print $1}')
        status=$(echo "$entry" | awk '{print $2}')
        green "Daemon is running (PID=$pid, last_exit=$status)"
    else
        warn "Daemon is NOT running"
    fi

    echo "  Binary : $BINARY_DST $(test -f "$BINARY_DST" && echo "(present)" || echo "(missing)")"
    echo "  Plist  : $PLIST_DST $(test -f "$PLIST_DST" && echo "(present)" || echo "(missing)")"
    echo "  Config : $CONFIG_DST $(test -f "$CONFIG_DST" && echo "(present)" || echo "(missing)")"
    echo "  Logs   : $LOG_DIR"
}

# ── Dispatch ──────────────────────────────────────────────────────────────────

case "$COMMAND" in
    install)   do_install   ;;
    uninstall) do_uninstall ;;
    start)     do_start     ;;
    stop)      do_stop      ;;
    restart)   do_stop; do_start ;;
    status)    do_status    ;;
    *)
        echo "Usage: sudo $0 {install|uninstall|start|stop|status|restart}" >&2
        exit 1
        ;;
esac
