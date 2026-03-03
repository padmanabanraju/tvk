# TVK Deployment Guide — DigitalOcean + tvk.inkbytes.dev

## Prerequisites
- DigitalOcean droplet (Ubuntu 24.04 LTS)
- Domain `inkbytes.dev` with DNS pointing to your droplet IP

## Step 1: Set Up DNS

In your domain registrar, add this DNS record:

```
A    tvk   → YOUR_DROPLET_IP
```

Wait 5-10 minutes for DNS to propagate.

## Step 2: SSH Into Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

## Step 3: Clone and Deploy

```bash
# Install git
apt-get update && apt-get install -y git

# Clone your repo
git clone https://github.com/YOUR_USERNAME/tvk.git
cd tvk

# Run the deploy script (replace with your email for SSL)
chmod +x deploy.sh
./deploy.sh your-email@example.com
```

That's it! Visit https://tvk.inkbytes.dev

## Updating TVK

After pushing code changes to GitHub:

```bash
ssh root@YOUR_DROPLET_IP
cd tvk
git pull
docker compose build tvk
docker compose up -d tvk
```

## Useful Commands

```bash
# View logs
docker compose logs -f tvk
docker compose logs -f nginx

# Restart
docker compose restart tvk

# Stop everything
docker compose down

# Start everything
docker compose up -d

# Check disk/memory usage
df -h
free -m
docker system df
```

## Adding More Apps Later

To host more apps on the same droplet, add new nginx server blocks
in `nginx/default.conf` for each subdomain:

- `tvk.inkbytes.dev` → TVK (stock app)
- `blog.inkbytes.dev` → Your blog
- `poems.inkbytes.dev` → Your poems
- `stories.inkbytes.dev` → Your stories

Each app gets its own Docker container + nginx server block, all on one droplet.
