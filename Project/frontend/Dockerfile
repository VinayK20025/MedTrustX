FROM node:20-alpine
RUN apk add --no-cache curl libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--max-old-space-size=3072" \
    HOSTNAME=0.0.0.0 \
    PORT=3000

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=15s --retries=5 \
    CMD curl -sf http://0.0.0.0:3000/ || exit 1

# Run in dev mode for presentation (lazy compilation, much lower memory)
CMD ["npm", "run", "dev"]
