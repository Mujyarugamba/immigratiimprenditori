# Data access layer (P2)

Concrete modules — not a generic repository.

| Path | Use |
|---|---|
| `public/` | Unauthenticated reads under RLS public SELECT |
| `authenticated/` | Session-scoped reads (Persona, Account self) |
| `rpc/` | Mutations/helpers that call published RPCs with user JWT |
| `admin/` | Server-only service-role operations (never imported from client) |

Authorization authority remains PostgreSQL RLS/RPC. These modules only organize calls.

## Public modules (P4)

| Module | Table(s) | Key helpers |
|---|---|---|
| `public/businesses.ts` | `businesses` | `listPublicBusinesses`, `getPublicBusinessById`, `listHomeBusinesses` |
| `public/professionals.ts` | `professional_profiles` | `listPublicProfessionals`, `getPublicProfessionalById`, `listHomeProfessionals` |
| `public/opportunities.ts` | `opportunities` | `listPublicOpportunities`, `getPublicOpportunityById`, `listHomeOpportunities` |
| `public/services.ts` | `service_offers`, `service_requests` | offers + requests list/detail/home helpers |
| `public/events.ts` | `events`, `event_editions` | `listPublicEvents`, `getPublicEventById`, `listHomeEvents` |
| `public/collaborations.ts` | `collaborations` | slug + id detail, `listHomeCollaborations` |
| `public/markets.ts` | `international_markets` | lookup by `code`, `listHomeMarkets` |
| `public/organizations.ts` | `organizations` | `getPublicOrganizationBySlug`, `listHomeOrganizations` |
| `public/observatory.ts` | `observatory_indicators` (+ values) | `getPublicIndicatorBySlug`, `listHomeIndicators` |
| `public/contents.ts` | `contents` (+ light link tables) | `getPublicContentBySlug`, `listHomeContents` |
| `public/paging.ts` | — | shared pagination/query-param helpers |
