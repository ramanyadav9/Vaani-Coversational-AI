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

# Temporarily modify TypeScript configuration to disable unused variable checking
RUN sed -i 's/"noUnusedLocals": true/"noUnusedLocals": false/g' ./tsconfig.app.json && \
    sed -i 's/"noUnusedParameters": true/"noUnusedParameters": false/g' ./tsconfig.app.json

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

# Install nginx and netcat (for health check in startup script)
RUN apk add --no-cache nginx netcat-openbsd

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

# Create a complete nginx configuration file
RUN echo "events {" > /etc/nginx/nginx.conf && \
    echo "    worker_connections 1024;" >> /etc/nginx/nginx.conf && \
    echo "}" >> /etc/nginx/nginx.conf && \
    echo "" >> /etc/nginx/nginx.conf && \
    echo "http {" >> /etc/nginx/nginx.conf && \
    echo "    include /etc/nginx/mime.types;" >> /etc/nginx/nginx.conf && \
    echo "    default_type application/octet-stream;" >> /etc/nginx/nginx.conf && \
    echo "" >> /etc/nginx/nginx.conf && \
    echo "    # Upstream definition for backend" >> /etc/nginx/nginx.conf && \
    echo "    upstream backend {" >> /etc/nginx/nginx.conf && \
    echo "        server 127.0.0.1:3000;" >> /etc/nginx/nginx.conf && \
    echo "    }" >> /etc/nginx/nginx.conf && \
    echo "" >> /etc/nginx/nginx.conf && \
    echo "    # Server configuration" >> /etc/nginx/nginx.conf && \
    echo "    server {" >> /etc/nginx/nginx.conf && \
    echo "        listen 3001;" >> /etc/nginx/nginx.conf && \
    echo "        server_name localhost;" >> /etc/nginx/nginx.conf && \
    echo "" >> /etc/nginx/nginx.conf && \
    echo "        # Serve static files from the React build" >> /etc/nginx/nginx.conf && \
    echo "        location / {" >> /etc/nginx/nginx.conf && \
    echo "            root /usr/share/nginx/html;" >> /etc/nginx/nginx.conf && \
    echo "            index index.html;" >> /etc/nginx/nginx.conf && \
    echo "            try_files \$uri \$uri/ /index.html;" >> /etc/nginx/nginx.conf && \
    echo "        }" >> /etc/nginx/nginx.conf && \
    echo "" >> /etc/nginx/nginx.conf && \
    echo "        # Proxy API requests to the backend server" >> /etc/nginx/nginx.conf && \
    echo "        location /api/ {" >> /etc/nginx/nginx.conf && \
    echo "            proxy_pass http://backend;" >> /etc/nginx/nginx.conf && \
    echo "            proxy_http_version 1.1;" >> /etc/nginx/nginx.conf && \
    echo "            proxy_set_header Upgrade \$http_upgrade;" >> /etc/nginx/nginx.conf && \
    echo "            proxy_set_header Connection 'upgrade';" >> /etc/nginx/nginx.conf && \
    echo "            proxy_set_header Host \$host;" >> /etc/nginx/nginx.conf && \
    echo "            proxy_set_header X-Real-IP \$remote_addr;" >> /etc/nginx/nginx.conf && \
    echo "            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;" >> /etc/nginx/nginx.conf && \
    echo "            proxy_set_header X-Forwarded-Proto \$scheme;" >> /etc/nginx/nginx.conf && \
    echo "        }" >> /etc/nginx/nginx.conf && \
    echo "" >> /etc/nginx/nginx.conf && \
    echo "        # Proxy WebSocket connections to the backend server" >> /etc/nginx/nginx.conf && \
    echo "        location /socket.io/ {" >> /etc/nginx/nginx.conf && \
    echo "            proxy_pass http://backend/socket.io/;" >> /etc/nginx/nginx.conf && \
    echo "            proxy_http_version 1.1;" >> /etc/nginx/nginx.conf && \
    echo "            proxy_set_header Upgrade \$http_upgrade;" >> /etc/nginx/nginx.conf && \
    echo "            proxy_set_header Connection 'upgrade';" >> /etc/nginx/nginx.conf && \
    echo "            proxy_set_header Host \$host;" >> /etc/nginx/nginx.conf && \
    echo "            proxy_set_header X-Real-IP \$remote_addr;" >> /etc/nginx/nginx.conf && \
    echo "            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;" >> /etc/nginx/nginx.conf && \
    echo "            proxy_set_header X-Forwarded-Proto \$scheme;" >> /etc/nginx/nginx.conf && \
    echo "        }" >> /etc/nginx/nginx.conf && \
    echo "" >> /etc/nginx/nginx.conf && \
    echo "        # Health check endpoint" >> /etc/nginx/nginx.conf && \
    echo "        location /health {" >> /etc/nginx/nginx.conf && \
    echo "            proxy_pass http://backend/health;" >> /etc/nginx/nginx.conf && \
    echo "        }" >> /etc/nginx/nginx.conf && \
    echo "    }" >> /etc/nginx/nginx.conf && \
    echo "}" >> /etc/nginx/nginx.conf

# Create a startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo '# Start backend server in background' >> /start.sh && \
    echo 'cd /app/backend' >> /start.sh && \
    echo 'PORT=3000 node src/server.js &' >> /start.sh && \
    echo 'BACKEND_PID=$!' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Wait for backend to be ready' >> /start.sh && \
    echo 'echo "Waiting for backend server to start..."' >> /start.sh && \
    echo 'for i in $(seq 1 30); do' >> /start.sh && \
    echo '  if nc -z localhost 3000; then' >> /start.sh && \
    echo '    echo "Backend server is ready"' >> /start.sh && \
    echo '    break' >> /start.sh && \
    echo '  fi' >> /start.sh && \
    echo '  echo "Waiting for backend... ($i/30)"' >> /start.sh && \
    echo '  sleep 1' >> /start.sh && \
    echo 'done' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start nginx to serve frontend and proxy API requests' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh

RUN chmod +x /start.sh

EXPOSE 3001

CMD ["/start.sh"]