# MedTrustX Gateway Architecture

The Gateway architecture consists of three distinct layers to handle massive throughput while enforcing zero-trust security:

1. **Kong Edge Gateway** (Managed by `kong-config-service`)
   - Handles global rate limiting, DDoS protection, WAF, and initial PQC Auth.
2. **API Composition Gateway** (`api-composition-gateway`)
   - FastAPI-based composition layer executing parallel sub-requests to downstream microservices with circuit breaking.
3. **GraphQL Federation Gateway** (`graphql-federation-gateway`)
   - Unified GraphQL schema exposing composed REST APIs for frontend consumption.
