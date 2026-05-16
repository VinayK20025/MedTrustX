#!/usr/bin/env bash
# MedTrustX Device Trust Agent — Linux Installer
#
# Installs the agent binary as a systemd service on Linux.
# Supports Debian/Ubuntu, RHEL/CentOS/Fedora, and other systemd-based distros.
#
# Prerequisites:
#   - systemd (systemctl must be available)
#   - Run as root (sudo ./install.sh)
#   - medtrustx-agent binary in same directory as this script
#     OR set $AGENT_BINARY_PATH
#
# Usage:
#   sudo ./install.sh [install|uninstall|start|stop|restart|status|enable|disable]
#
# Environment variables:
#   AGENT_BINARY_PATH  — path to medtrustx-agent binary
#                        (default: <script dir>/medtrustx-agent)
#   AGENT_INSTALL_DIR  — installation directory (default: /usr/local/bin)
#   AGENT_CONFIG_DIR   — config directory (default: /etc/medtrustx)
#   AGENT_LOG_DIR      — log directory (default: /var/log/medtrustx)
#   AGENT_USER         — service runtime user (default: medtrustx)
#   AGENT_GROUP        — service runtime group (default: medtrustx)
#   AGENT_ENV_FILE     — source .env config file (optional)
#                        (default: <script dir>/agent.env)
#   SYSTEMD_UNIT_DIR   — systemd unit directory (default: /etc/systemd/system)
#   SKIP_SERVICE_START — set to 1 to install but not start the service

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BINARY_SRC="${AGENT_BINARY_PATH:-$SCRIPT_DIR/medtrustx-agent}"
INSTALL_DIR="${AGENT_INSTALL_DIR:-/usr/local/bin}"
CONFIG_DIR="${AGENT_CONFIG_DIR:-/etc/medtrustx}"
LOG_DIR="${AGENT_LOG_DIR:-/var/log/medtrustx}"
AGENT_USER="${AGENT_USER:-medtrustx}"
AGENT_GROUP="${AGENT_GROUP:-medtrustx}"
ENV_SRC="${AGENT_ENV_FILE:-$SCRIPT_DIR/agent.env}"
SYSTEMD_DIR="${SYSTEMD_UNIT_DIR:-/etc/systemd/system}"
SKIP_START="${SKIP_SERVICE_START:-0}"

BINARY_DST="$INSTALL_DIR/medtrustx-agent"
CONFIG_DST="$CONFIG_DIR/agent.env"
SERVICE_NAME="medtrustx-agent"
SERVICE_FILE="$SYSTEMD_DIR/${SERVICE_NAME}.service"
SERVICE_SRC="$SCRIPT_DIR/${SERVICE_NAME}.service"

COMMAND="${1:-install}"

# ── Helpers ───────────────────────────────────────────────────────────────────

cyan()  { printf '\033[1;36m%s\033[0m\n' "$*"; }
green() { printf '\033[1;32m[OK] %s\033[0m\n' "$*"; }
warn()  { printf '\033[1;33m[WARN] %s\033[0m\n' "$*" >&2; }
die()   { printf '\033[1;31m[FAIL] %s\033[0m\n' "$*" >&2; exit 1; }
step()  { echo; cyan "[MedTrustX Install] $*"; }

require_root()   { [[ "$(id -u)" -eq 0 ]] || die "Run as root (sudo $0 $COMMAND)"; }
require_systemd() { command -v systemctl &>/dev/null || die "systemd/systemctl not found"; }

# ── Install ───────────────────────────────────────────────────────────────────

do_install() {
    require_root
    require_systemd

    step "Checking prerequisites"
    [[ -f "$BINARY_SRC" ]] \
        || die "Binary not found: $BINARY_SRC\nSet AGENT_BINARY_PATH or copy medtrustx-agent next to this script."
    green "Binary: $BINARY_SRC"

    # Stop existing service if running
    if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
        warn "Stopping existing service"
        systemctl stop "$SERVICE_NAME"
    fi

    step "Creating system user and group"
    if ! getent group "$AGENT_GROUP" &>/dev/null; then
        groupadd --system "$AGENT_GROUP"
        green "Group created: $AGENT_GROUP"
    else
        warn "Group already exists: $AGENT_GROUP"
    fi
    if ! getent passwd "$AGENT_USER" &>/dev/null; then
        useradd \
            --system \
            --gid "$AGENT_GROUP" \
            --no-create-home \
            --shell /usr/sbin/nologin \
            --comment "MedTrustX Device Trust Agent" \
            "$AGENT_USER"
        green "User created: $AGENT_USER"
    else
        warn "User already exists: $AGENT_USER"
    fi

    step "Creating directories"
    install -d -m 755 -o root         -g root         "$INSTALL_DIR"
    install -d -m 750 -o root         -g "$AGENT_GROUP" "$CONFIG_DIR"
    install -d -m 750 -o "$AGENT_USER" -g "$AGENT_GROUP" "$LOG_DIR"
    green "Directories created"

    step "Installing binary"
    install -m 755 -o root -g root "$BINARY_SRC" "$BINARY_DST"
    green "Installed: $BINARY_DST"

    step "Installing configuration"
    if [[ -f "$ENV_SRC" ]]; then
        install -m 640 -o root -g "$AGENT_GROUP" "$ENV_SRC" "$CONFIG_DST"
        green "Config: $CONFIG_DST"
    else
        warn "No agent.env at $ENV_SRC — creating empty config"
        touch "$CONFIG_DST"
        chmod 640 "$CONFIG_DST"
        chown root:"$AGENT_GROUP" "$CONFIG_DST"
    fi

    step "Installing systemd unit"
    if [[ -f "$SERVICE_SRC" ]]; then
        install -m 644 -o root -g root "$SERVICE_SRC" "$SERVICE_FILE"
        green "Unit file: $SERVICE_FILE"
    else
        # Generate unit inline
        cat > "$SERVICE_FILE" <<UNIT
[Unit]
Description=MedTrustX Device Trust Agent
Documentation=https://docs.medtrustx.io/agent
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
User=${AGENT_USER}
Group=${AGENT_GROUP}
ExecStart=${BINARY_DST} run --foreground
Restart=on-failure
RestartSec=10
TimeoutStartSec=30
TimeoutStopSec=30
WatchdogSec=30

# Environment
EnvironmentFile=-${CONFIG_DST}
Environment=AGENT_LOG_FILE_PATH=${LOG_DIR}/agent.log

# Hardening
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=${LOG_DIR} ${CONFIG_DIR}
PrivateTmp=yes
PrivateDevices=yes
ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectControlGroups=yes
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
RestrictNamespaces=yes
LockPersonality=yes
MemoryDenyWriteExecute=no
RestrictRealtime=yes
RestrictSUIDSGID=yes
SystemCallFilter=@system-service
SystemCallErrorNumber=EPERM

[Install]
WantedBy=multi-user.target
UNIT
        chmod 644 "$SERVICE_FILE"
        green "Generated unit: $SERVICE_FILE"
    fi

    step "Reloading systemd and enabling service"
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    green "Service enabled (will start on boot)"

    if [[ "$SKIP_START" != "1" ]]; then
        step "Starting service"
        systemctl start "$SERVICE_NAME"
        sleep 1
        if systemctl is-active --quiet "$SERVICE_NAME"; then
            green "Service running: $SERVICE_NAME"
        else
            warn "Service may not have started — check: journalctl -u $SERVICE_NAME"
        fi
    else
        warn "Skipping start (SKIP_SERVICE_START=1)"
    fi

    echo
    cyan "════════════════════════════════════════════════"
    green "Installation complete!"
    echo "  Binary  : $BINARY_DST"
    echo "  Config  : $CONFIG_DST"
    echo "  Logs    : $LOG_DIR"
    echo "  Service : $SERVICE_NAME"
    echo
    echo "  Status  : systemctl status $SERVICE_NAME"
    echo "  Logs    : journalctl -u $SERVICE_NAME -f"
    echo "  Config  : sudo $EDITOR $CONFIG_DST"
    cyan "════════════════════════════════════════════════"
}

# ── Uninstall ─────────────────────────────────────────────────────────────────

do_uninstall() {
    require_root
    require_systemd

    step "Stopping and disabling service"
    systemctl stop    "$SERVICE_NAME" 2>/dev/null || true
    systemctl disable "$SERVICE_NAME" 2>/dev/null || true
    green "Service stopped and disabled"

    step "Removing unit file"
    if [[ -f "$SERVICE_FILE" ]]; then
        rm -f "$SERVICE_FILE"
        systemctl daemon-reload
        green "Removed: $SERVICE_FILE"
    fi

    step "Removing binary"
    rm -f "$BINARY_DST" && green "Removed: $BINARY_DST" || warn "Binary not found"

    # Preserve config and logs; remove service user
    warn "Config and logs preserved: $CONFIG_DIR, $LOG_DIR"

    if getent passwd "$AGENT_USER" &>/dev/null; then
        userdel "$AGENT_USER" 2>/dev/null || warn "Could not remove user $AGENT_USER"
    fi

    green "Uninstall complete"
}

# ── Service control ───────────────────────────────────────────────────────────

do_start()   { require_root; systemctl start   "$SERVICE_NAME"; green "Started"; }
do_stop()    { require_root; systemctl stop    "$SERVICE_NAME"; green "Stopped"; }
do_enable()  { require_root; systemctl enable  "$SERVICE_NAME"; green "Enabled"; }
do_disable() { require_root; systemctl disable "$SERVICE_NAME"; green "Disabled"; }

do_status() {
    systemctl status "$SERVICE_NAME" --no-pager || true
    echo
    echo "Recent logs:"
    journalctl -u "$SERVICE_NAME" -n 20 --no-pager 2>/dev/null || true
}

# ── Dispatch ──────────────────────────────────────────────────────────────────

case "$COMMAND" in
    install)   do_install   ;;
    uninstall) do_uninstall ;;
    start)     do_start     ;;
    stop)      do_stop      ;;
    restart)   require_root; systemctl restart "$SERVICE_NAME"; green "Restarted" ;;
    status)    do_status    ;;
    enable)    do_enable    ;;
    disable)   do_disable   ;;
    *)
        echo "Usage: sudo $0 {install|uninstall|start|stop|restart|status|enable|disable}" >&2
        exit 1
        ;;
esac
