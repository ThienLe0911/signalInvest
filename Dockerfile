# syntax=docker/dockerfile:1

# Stage 1: Base image with Alpine & libc6-compat
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 2: Install dependencies based on package-lock.json
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Stage 3: Build the application with Next.js standalone output
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure public directory exists
RUN mkdir -p public

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 4: Production runner with minimal Alpine footprint and non-root user
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create secure non-root user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets, standalone build and static files with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ensure data directory exists with write permissions for persistent storage
RUN mkdir -p data && chown -R nextjs:nodejs data

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
