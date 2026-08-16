/**
 * Thin re-exports of Access RPC wrappers used in P2/P3/P5.
 * Semantics stay in PostgreSQL; these modules add typing/boundary only.
 */
export { ensureAccountProvisioned } from "@/lib/access/ensure-account";
export { linkOwnPerson } from "@/lib/access/link-person";
export { provisionAccountForAuthUser } from "@/lib/access/provision-account";
export { closeAccount } from "@/lib/data/admin/accounts";
export {
  assignRole as assignApplicationRole,
  revokeRole as revokeApplicationRole,
} from "@/lib/data/admin/roles";
export {
  bootstrapBusinessGrant,
  grantBusinessManagement,
  revokeBusinessManagement,
} from "@/lib/data/rpc/business-management";
export { linkPersonToAccount } from "@/lib/data/admin/link-person";