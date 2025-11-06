# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json vite.config.ts bun.lock* ./

# Install build dependencies
RUN npm install --omit dev
# (normal dependencies are used as build dependencies!)

# Copy source files
COPY src ./src

# Build frontend & backend
RUN npm run build:frontend:docker
RUN npm run build:backend

# Stage 2: Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy output from builder
COPY --from=builder /app/dist_frontend ./dist_frontend
COPY --from=builder /app/dist_backend  ./dist_backend

# Declare container IO
EXPOSE 3000
RUN mkdir /data
VOLUME ["/data"]

# Set environment variables for backend
ENV DATA_DIR=/data
ENV STATIC_DIR=/app/dist_frontend

# Run the compiled backend
CMD ["node", "/app/dist_backend/backend.js"]
