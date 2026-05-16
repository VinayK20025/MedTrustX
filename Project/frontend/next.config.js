/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Proxy all /api/v1/* calls to the appropriate backend services
  async rewrites() {
    // IAM service runs directly on port 5001 (FastAPI)
    const iamUrl = process.env.IAM_INTERNAL_URL || 'http://localhost:5001';
    // Gateway/other services run on port 4001
    const gatewayUrl = process.env.GATEWAY_INTERNAL_URL || 'http://localhost:4001';
    // Kong (if running) on port 8000, fallback to gateway
    const apiUrl = process.env.API_INTERNAL_URL || 'http://localhost:4001';
    // MedTrustX Gateway Services (enforce access through Kong Edge Gateway)
    const kongConfigUrl = process.env.KONG_EDGE_URL || 'http://localhost:8000';
    const compositionUrl = process.env.KONG_EDGE_URL || 'http://localhost:8000';
    const graphqlGwUrl = process.env.KONG_EDGE_URL || 'http://localhost:8000';


    return [
      // IAM auth calls go directly to IAM FastAPI service
      {
        source: '/api/v1/iam/:path*',
        destination: `${iamUrl}/api/v1/iam/:path*`,
      },
      // ── MedTrustX Kong Config Service (port 8021) ──────────────────────
      {
        source: '/api/gateway/kong/:path*',
        destination: `${kongConfigUrl}/api/gateway/:path*`,
      },
      {
        source: '/api/v1/kong-gateway/:path*',
        destination: `${kongConfigUrl}/api/gateway/:path*`,
      },
      // ── MedTrustX API Composition Gateway (port 8022) ──────────────────
      {
        source: '/api/gateway/composition/:path*',
        destination: `${compositionUrl}/api/composed/:path*`,
      },
      {
        source: '/api/gateway/discovery/:path*',
        destination: `${compositionUrl}/api/discovery/:path*`,
      },
      {
        source: '/api/v1/api-composition/:path*',
        destination: `${compositionUrl}/api/:path*`,
      },
      // ── MedTrustX GraphQL Federation Gateway (port 8023) ───────────────
      {
        source: '/graphql/:path*',
        destination: `${graphqlGwUrl}/graphql/:path*`,
      },
      {
        source: '/api/graphql-gateway/:path*',
        destination: `${graphqlGwUrl}/:path*`,
      },
      // Gateway health/events
      {
        source: '/api/v1/gateway/:path*',
        destination: `${gatewayUrl}/api/v1/gateway/:path*`,
      },
      // All other API calls via gateway
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
      // WebSocket events (direct to gateway-service)
      {
        source: '/ws/:path*',
        destination: `${gatewayUrl}/ws/:path*`,
      },
    ];
  },


  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' ws: wss: http://* https://* http://localhost:* https://localhost:*",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Webpack optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
