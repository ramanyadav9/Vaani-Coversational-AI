# Virtual Vani AI - Server Deployment Guide

This guide will help you deploy and run the Virtual Vani AI project on a production server.

## Prerequisites

Before deploying, ensure your server has:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (to clone the repository)
- **PM2** (for process management) - `npm install -g pm2`

## Step 1: Clone the Repository

```bash
# SSH into your server first
ssh user@your-server-ip

# Clone the repository
git clone https://github.com/ramanyadav9/Vaani-Coversational-AI.git
cd Vaani-Coversational-AI
```

## Step 2: Backend Setup

### 2.1 Install Backend Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
nano .env
```

Add the following environment variables:

```env
API_KEY=your_elevenlabs_api_key
BASE_URL=https://api.elevenlabs.io
YOUR_PHONE_NUMBER_ID=your_phone_number_id
YOUR_PHONE_NUMBER=your_phone_number
PORT=3000
```

**Important:** Replace with your actual ElevenLabs credentials.

### 2.3 Test Backend

```bash
# Test run
npm start

# You should see: "Server running on port 3000"
```

Press `Ctrl+C` to stop after testing.

## Step 3: Frontend Setup

### 3.1 Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 3.2 Configure Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
nano .env
```

For **local development:**
```env
VITE_API_URL=http://localhost:3000
```

For **production** (replace with your actual domain/IP):
```env
VITE_API_URL=http://your-domain.com/api
# OR if using IP
VITE_API_URL=http://your-server-ip:3000
```

### 3.3 Build Frontend for Production

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

## Step 4: Production Deployment Options

### Option A: Using PM2 (Recommended)

PM2 keeps your application running, restarts on crashes, and provides monitoring.

#### 4.1 Start Backend with PM2

```bash
cd backend
pm2 start src/server.js --name "vani-backend"
pm2 save
pm2 startup
```

#### 4.2 Serve Frontend with PM2

```bash
cd ../frontend
pm2 serve dist 5000 --name "vani-frontend" --spa
pm2 save
```

#### 4.3 Check Status

```bash
pm2 status
pm2 logs vani-backend
pm2 logs vani-frontend
```

### Option B: Using Nginx (Professional Setup)

Nginx serves the frontend and proxies API requests to the backend.

#### 4.1 Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

#### 4.2 Start Backend with PM2

```bash
cd backend
pm2 start src/server.js --name "vani-backend"
pm2 save
pm2 startup
```

#### 4.3 Configure Nginx

Create an Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/vani-ai
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or server IP

    # Serve frontend
    root /path/to/Vaani-Coversational-AI/frontend/dist;
    index index.html;

    # Frontend routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 4.4 Enable and Start Nginx

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/vani-ai /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 5: Firewall Configuration

Open necessary ports:

```bash
# For PM2 only (Option A)
sudo ufw allow 3000  # Backend
sudo ufw allow 5000  # Frontend

# For Nginx (Option B)
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (if using SSL)
sudo ufw allow 3000  # Backend (only if accessing directly)
```

## Step 6: Access Your Application

### Option A (PM2):
- Frontend: `http://your-server-ip:5000`
- Backend: `http://your-server-ip:3000`

### Option B (Nginx):
- Application: `http://your-domain.com` or `http://your-server-ip`
- API: `http://your-domain.com/api` or `http://your-server-ip/api`

## Step 7: SSL/HTTPS Setup (Recommended)

For production, always use HTTPS:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renew
sudo certbot renew --dry-run
```

## Useful PM2 Commands

```bash
# View logs
pm2 logs

# Restart services
pm2 restart vani-backend
pm2 restart vani-frontend

# Stop services
pm2 stop vani-backend
pm2 stop vani-frontend

# Delete services
pm2 delete vani-backend
pm2 delete vani-frontend

# Monitor
pm2 monit

# List all processes
pm2 list
```

## Updating Your Application

When you push updates to GitHub:

```bash
# Pull latest code
git pull origin main

# Update backend
cd backend
npm install
pm2 restart vani-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart vani-frontend  # If using PM2 to serve
# OR
sudo systemctl restart nginx  # If using Nginx
```

## Troubleshooting

### Backend Issues

```bash
# Check backend logs
pm2 logs vani-backend

# Check if port 3000 is in use
lsof -i :3000

# Restart backend
pm2 restart vani-backend
```

### Frontend Issues

```bash
# Check frontend logs
pm2 logs vani-frontend

# Rebuild frontend
cd frontend
npm run build
pm2 restart vani-frontend
```

### API Connection Issues

If frontend can't connect to backend:
1. Check `frontend/.env` has correct `VITE_API_URL`
2. Rebuild frontend after changing `.env`: `npm run build`
3. Check firewall allows backend port
4. Check Nginx proxy configuration (if using Nginx)

### Database/API Issues

Check ElevenLabs API credentials in `backend/.env`:
- Verify `API_KEY` is correct
- Verify `YOUR_PHONE_NUMBER_ID` is correct
- Check API quota/limits on ElevenLabs dashboard

## Architecture Overview

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Frontend App   │────▶│  Backend API     │
│  (React/Vite)   │     │  (Node/Express)  │
│  Port: 5000     │     │  Port: 3000      │
└─────────────────┘     └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  ElevenLabs API  │
                        │  (Voice Calls)   │
                        └──────────────────┘
```

## Security Checklist

- [ ] Change default ports if needed
- [ ] Set up firewall rules
- [ ] Use HTTPS/SSL certificates
- [ ] Keep `.env` files secure (never commit to git)
- [ ] Regularly update dependencies: `npm audit fix`
- [ ] Set up monitoring and logging
- [ ] Regular backups of configuration
- [ ] Use strong API keys
- [ ] Limit CORS origins in production

## Performance Optimization

1. **Enable Gzip compression** in Nginx
2. **Use CDN** for static assets
3. **Set up caching headers** in Nginx
4. **Monitor resource usage**: `pm2 monit`
5. **Set up log rotation** for PM2 logs

## Support

For issues or questions:
- GitHub Repository: https://github.com/ramanyadav9/Vaani-Coversational-AI
- Check backend logs: `pm2 logs vani-backend`
- Check frontend logs: `pm2 logs vani-frontend`

---

**Note:** This is a production-ready deployment guide. Always test in a staging environment before deploying to production.
