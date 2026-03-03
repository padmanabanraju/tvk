#!/bin/bash
# TVK Deployment Script for DigitalOcean Ubuntu 24.04
# Domain: inkbytes.dev
# Usage: ssh into droplet, clone repo, run this script

set -e

DOMAIN="tvk.inkbytes.dev"
EMAIL="${1:-}"

if [ -z "$EMAIL" ]; then
  echo "Usage: ./deploy.sh your-email@example.com"
  echo "Email is needed for Let's Encrypt SSL certificate."
  exit 1
fi

echo "================================"
echo "  TVK Deployment — $DOMAIN"
echo "================================"

# ── Step 1: Firewall + Security ──
echo ""
echo "[1/7] Setting up firewall..."
apt-get update -qq
apt-get install -y -qq ufw fail2ban > /dev/null

# Allow only SSH, HTTP, HTTPS — block everything else
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (redirects to HTTPS)
ufw allow 443/tcp   # HTTPS
echo "y" | ufw enable

# fail2ban — auto-blocks IPs after 5 failed SSH attempts
cat > /etc/fail2ban/jail.local << 'F2B'
[sshd]
enabled = true
port = ssh
maxretry = 5
bantime = 3600
findtime = 600
F2B
systemctl enable fail2ban
systemctl restart fail2ban

echo "  Firewall active (ports 22, 80, 443 only)"
echo "  fail2ban active (blocks brute-force SSH attempts)"

# ── Step 2: Install Docker ──
echo ""
echo "[2/7] Installing Docker..."
if ! command -v docker &> /dev/null; then
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  echo "  Docker installed."
else
  echo "  Docker already installed."
fi

# ── Step 3: Build TVK ──
echo ""
echo "[3/7] Building TVK container..."
docker compose build

# ── Step 4: Get SSL certificate ──
echo ""
echo "[4/7] Obtaining SSL certificate for $DOMAIN..."

# First, start with a temporary nginx config for HTTP-only (for certbot challenge)
cat > nginx/default.conf.tmp << TMPCONF
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'TVK is setting up SSL...';
        add_header Content-Type text/plain;
    }
}
TMPCONF

# Use temporary config for initial cert
cp nginx/default.conf nginx/default.conf.ssl
cp nginx/default.conf.tmp nginx/default.conf

# Start nginx with HTTP-only config
docker compose up -d nginx

# Get the certificate
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

# Restore full SSL config
cp nginx/default.conf.ssl nginx/default.conf
rm nginx/default.conf.tmp nginx/default.conf.ssl

echo "  SSL certificate obtained!"

# ── Step 5: Start everything ──
echo ""
echo "[5/7] Starting TVK..."
docker compose down
docker compose up -d

echo "  TVK is running!"

# ── Step 6: Auto-renew SSL ──
echo ""
echo "[6/7] Setting up SSL auto-renewal..."
CRON_JOB="0 3 * * 1 cd $(pwd) && docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload"
(crontab -l 2>/dev/null | grep -v certbot; echo "$CRON_JOB") | crontab -

echo "  Auto-renewal cron job added (weekly at 3am Monday)."

# ── Step 7: Auto security updates ──
echo ""
echo "[7/7] Enabling automatic security updates..."
apt-get install -y -qq unattended-upgrades > /dev/null
dpkg-reconfigure -plow unattended-upgrades 2>/dev/null || true
echo "  Unattended security updates enabled."

echo ""
echo "================================"
echo "  TVK is LIVE & SECURED!"
echo "  https://$DOMAIN"
echo "================================"
echo ""
echo "Security:"
echo "  - Firewall: only ports 22, 80, 443 open"
echo "  - fail2ban: blocks IPs after 5 failed SSH logins"
echo "  - HTTPS: all traffic encrypted (auto-renews)"
echo "  - Auto security updates enabled"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f tvk    # View app logs"
echo "  docker compose logs -f nginx  # View nginx logs"
echo "  docker compose restart tvk    # Restart app"
echo "  docker compose down           # Stop everything"
echo "  docker compose up -d          # Start everything"
echo "  ufw status                    # Check firewall rules"
echo "  fail2ban-client status sshd   # Check blocked IPs"
