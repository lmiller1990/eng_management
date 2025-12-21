# Home Server Plan

Plan for running the app stack on personal hardware with minimal ops, plus a note on post-server automation.

## Host and OS
- Hardware: consumer box (32 GB RAM, AMD 5950x, discrete GPU OK), good airflow; enable virtualization (SVM) and power-on-after-power-loss in BIOS.
- OS: Ubuntu Server 22.04 LTS (minimal install). Create a sudo user with SSH key; disable password login.
- Disk layout: If single disk, LUKS + ext4 with `/` (40–60 GB), `/var/lib` (rest), swap 8–16 GB. If two disks, consider ZFS mirror with a dataset for `/var/lib` (compression on). Put app data under `/var/lib/apps`.
- Timezone/locale set correctly; NTP enabled by default.

## Base Hardening
- SSH: `PasswordAuthentication no`, `PermitRootLogin prohibit-password` in `/etc/ssh/sshd_config.d/10-custom.conf`; restart ssh. Optionally bind sshd to LAN only.
- Firewall: `ufw default deny incoming`; allow 22 (or VPN), 80/443. Enable UFW.
- Updates: `apt update && apt upgrade -y`; install `unattended-upgrades fail2ban needrestart`. Enable unattended upgrades; fail2ban defaults protect SSH.

## Networking
- Router: give the host a static DHCP lease. Forward 80/443 to the host for public apps.
- Dynamic IP: set up DDNS (Cloudflare/Tailscale DDNS/etc.) if ISP IP changes.
- Admin access: prefer VPN (Tailscale/ZeroTier) so SSH is LAN/VPN-only.

## Runtime Stack
- Base tools: `curl git htop ncdu tmux smartmontools`.
- Containers: install Docker (`get.docker.com`) and `docker-compose-plugin`; add user to `docker` group.
- Paths: create `/opt/apps/<app>` for compose files and `/var/lib/apps/<app>` for volumes; owned by the app user.

## Ingress and TLS
- Install Caddy (official repo). ACME data in `/var/lib/caddy`.
- Caddyfile example:
  ```
  example.com {
    reverse_proxy localhost:3000
    encode zstd gzip
  }
  ```
- Reload with `systemctl reload caddy` after edits.

## App Orchestration and Autostart
- Each app: `docker-compose.yml` in `/opt/apps/<app>`, volumes under `/var/lib/apps/<app>`.
- Systemd unit per stack to survive reboots:
  ```
  [Unit]
  Description=<app> stack
  Requires=docker.service
  After=docker.service

  [Service]
  Type=oneshot
  WorkingDirectory=/opt/apps/<app>
  ExecStart=/usr/bin/docker compose up -d
  ExecStop=/usr/bin/docker compose down
  RemainAfterExit=yes
  TimeoutStartSec=300

  [Install]
  WantedBy=multi-user.target
  ```
- Enable with `systemctl daemon-reload && systemctl enable --now <app>.service`.

## Backups and Restore
- Install `rclone`; configure remote (e.g., Backblaze B2/Wasabi) or second disk.
- Nightly: `pg_dump` for databases; `tar` critical dirs (`/opt/apps`, `/etc/caddy`, `/var/lib/apps/<app>`) to a staging dir, then `rclone sync` to remote. Use a systemd timer instead of cron. Keep retention/versioning on the remote.
- Periodically test restore into a disposable container/path.

## Monitoring and Health
- `smartmontools` for disk checks (monthly). Temperature checks via `sensors`/`lm-sensors`.
- Uptime/HTTP checks: Netdata or Uptime Kuma on this or another host. Alert on disk space, CPU temp, and service down.

## Power and Recovery
- If possible, put on a UPS and configure `nut` for graceful shutdown on low battery.
- BIOS: ensure auto-boot after power loss. Verify services are enabled so everything returns after reboot.

## Post-Server Step: Reprovision Anywhere
- Capture the above as code: use Ansible to apply base hardening, packages, Docker, Caddy, systemd units, backup timers; keep inventories for `home` and `vps` targets.
- Terraform/CLI for provider-specific provisioning (e.g., Hetzner server + volume), then run Ansible with host-specific vars (IPs, DNS, whether to install Tailscale).
- Apps and Caddyfile templated from vars so moving hosts is updating DNS + running the same playbook.
