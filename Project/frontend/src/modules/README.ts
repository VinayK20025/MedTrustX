/**
 * MedTrustX — Module Scaffold README
 * ──────────────────────────────────────────────
 * Each feature module must follow this structure:
 *
 * /modules/<domain>
 *   /components      — Domain-specific UI components
 *   /hooks           — Data-fetching & domain logic hooks
 *   /services        — API client for the corresponding backend service
 *   /types           — TypeScript types/interfaces for this domain
 *   /pages           — Page-level components (used by Next.js routes)
 *   index.ts         — Barrel export
 *
 * Example: Patient Module
 *   /modules/patient
 *     /components/PatientCard.tsx
 *     /components/PatientList.tsx
 *     /hooks/usePatients.ts
 *     /services/patient.api.ts
 *     /types/patient.types.ts
 *     /pages/PatientListPage.tsx
 *     /pages/PatientDetailPage.tsx
 *     index.ts
 *
 * Rules:
 * 1. Each module maps 1:1 with a backend microservice
 * 2. Modules import from @/components, @/hooks, @/services, @/utils — never from other modules directly
 * 3. Cross-module communication happens via events (useEventSubscription) or global stores
 * 4. Module-specific types stay in the module; shared types go to @/types
 */
export {};
