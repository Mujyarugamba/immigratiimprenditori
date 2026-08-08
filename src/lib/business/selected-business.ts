import { cookies } from "next/headers";
import { SELECTED_BUSINESS_COOKIE } from "@/types/business";

export { resolveSelectedBusinessId } from "@/lib/business/selection";

/**
 * UI-only selected Impresa. Not stored on Account. Not an authorization source.
 */
export async function getSelectedBusinessId(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(SELECTED_BUSINESS_COOKIE)?.value;
  if (!value || !/^[0-9a-f-]{36}$/i.test(value)) {
    return null;
  }
  return value;
}

export async function setSelectedBusinessId(
  businessId: string | null,
): Promise<void> {
  const jar = await cookies();
  if (!businessId) {
    jar.delete(SELECTED_BUSINESS_COOKIE);
    return;
  }
  jar.set(SELECTED_BUSINESS_COOKIE, businessId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
  });
}
