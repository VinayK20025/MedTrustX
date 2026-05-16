# MedTrustX — Node.js Service Dockerfile (NestJS)
FROM node:20-alpine AS base
RUN apk add --no-cache curl
WORKDIR /app
COPY package.json ./

# ─── Deps stage (all deps including devDeps for build) ───────
FROM base AS build
RUN npm install
COPY . .
RUN chmod +x ./node_modules/.bin/* || true
RUN npm run build

# ─── Production stage ────────────────────────────────────────
FROM node:20-alpine AS production
RUN apk add --no-cache curl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
