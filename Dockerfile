# ---- Stage 1: Install Dependencies ----
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# ---- Stage 2: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (Next.js bakes NEXT_PUBLIC_* into the bundle)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ZITADEL_ISSUER
ARG NEXT_PUBLIC_ZITADEL_CLIENT_ID

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_ZITADEL_ISSUER=${NEXT_PUBLIC_ZITADEL_ISSUER}
ENV NEXT_PUBLIC_ZITADEL_CLIENT_ID=${NEXT_PUBLIC_ZITADEL_CLIENT_ID}

RUN npm run build

# ---- Stage 3: Run ----
FROM node:20-alpine AS runner

WORKDIR /app

# Security: run as non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
USER nextjs:nextjs

# Copy only what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
