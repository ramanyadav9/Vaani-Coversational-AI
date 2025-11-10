# Multi-stage Dockerfile for Conversational AI Project
# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./frontend/
COPY package*.json ./

# Install root dependencies
RUN npm install

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Copy production environment file for the build
COPY frontend/.env.production .env

# Build the frontend with environment variables
RUN npm run build

# Stage 2: Install backend dependencies
FROM node:20-alpine AS backend-deps

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/
COPY package*.json ./

# Install root dependencies
RUN npm install

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Stage 3: Production server with nginx to serve both frontend and backend
FROM node:20-alpine

# Install nginx
RUN apk add --no-cache nginx

# Create app directory
WORKDIR /app

# Copy backend source
COPY backend/ ./backend/
COPY --from=backend-deps /app/node_modules ./node_modules
COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules

# Copy built frontend to nginx directory
RUN rm -rf /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/share/nginx/html
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Create custom nginx config to serve frontend and proxy API requests to backend
RUN echo 'server {
    listen 3001;
    server_name localhost;

    # Serve static files from the React build
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the backend server
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy WebSocket connections to the backend server
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:3000/health;
    }
}' > /etc/nginx/conf.d/conversational-ai.conf

# Create a startup script
RUN echo '#!/bin/sh
# Start backend server in background
cd /app/backend
PORT=3000 node src/server.js &

# Start nginx to serve frontend and proxy API requests
nginx -g "daemon off;"
' > /start.sh

RUN chmod +x /start.sh

EXPOSE 3001

CMD ["/start.sh"]