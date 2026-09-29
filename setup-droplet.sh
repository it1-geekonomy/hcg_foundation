#!/usr/bin/env bash
# One-time setup for a fresh Ubuntu 24.04 DigitalOcean Droplet. Run as root.
set -euo pipefail

echo "==> Updating packages"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
apt-get install -y ca-certificates curl git ufw

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installing Docker"
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

# Next.js builds can exceed RAM on small droplets
if ! swapon --show | grep -q /swapfile; then
  echo "==> Adding 2G swap"
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Configuring firewall (SSH, HTTP, HTTPS only)"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> Done. Docker: $(docker --version)"
