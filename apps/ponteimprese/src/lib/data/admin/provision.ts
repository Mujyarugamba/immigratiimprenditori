/**
 * Server-only administrative Access operations.
 * Do not import from Client Components or browser bundles.
 */
export { provisionAccountForAuthUser } from "@/lib/access/provision-account";
export { closeAccount } from "@/lib/data/admin/accounts";
export {
  assignRole as assignApplicationRole,
  revokeRole as revokeApplicationRole,
} from "@/lib/data/admin/roles";
export { linkPersonToAccount } from "@/lib/data/admin/link-person";
