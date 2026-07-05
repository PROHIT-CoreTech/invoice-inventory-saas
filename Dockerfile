# ===================================================
# Multi-stage production build for Billing ERP Monorepo
# ===================================================

# Stage 1: Build the applications
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# Copy root configurations and package manifests
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/database/package.json ./packages/database/
COPY packages/api-client/package.json ./packages/api-client/

# Install all dependencies (including devDependencies for compilation)
RUN npm install

# Copy source code files
COPY tsconfig.json ./
COPY packages/database/ ./packages/database/
COPY packages/api-client/ ./packages/api-client/
COPY apps/backend/ ./apps/backend/

# Generate Prisma Client and Compile TypeScript code across all workspaces
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN npm run build --workspace=@procash-invoices/database
RUN npm run build --workspace=@procash-invoices/api-client
RUN npm run build --workspace=@procash-invoices/backend

# Prune devDependencies to reduce image size
RUN npm prune --omit=dev

# Stage 2: Production runner stage (keeps image lightweight)
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy node_modules and built dist directories from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json

EXPOSE 8080

# Run the Express server
CMD ["node", "apps/backend/dist/index.js"]
