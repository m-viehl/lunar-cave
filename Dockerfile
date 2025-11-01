# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies (using npm since we're in Docker)
RUN npm install

# Copy source files
COPY src/backend ./src/backend
COPY src/tsconfig.json ./src/tsconfig.json

# Compile TypeScript to dist directory
RUN npx tsc --project src/backend/tsconfig.json --outDir src/backend/dist --module es2022 --target es2022 --moduleResolution node

# Stage 2: Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package.json ./
RUN npm install --only=production

# Copy compiled JavaScript from builder
COPY --from=builder /app/src/backend/dist ./src/backend/dist

# Expose port 3000
EXPOSE 3000

# Set working directory to backend (so highscores.json is in the same directory)
WORKDIR /app/src/backend

# Run the compiled backend
CMD ["node", "dist/main.js"]

