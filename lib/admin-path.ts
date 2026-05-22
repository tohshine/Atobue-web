/** Obscured admin console path — share only with authorized staff. */
export const ADMIN_BASE_PATH = "/cp-8f3k2m9x7p4q1";

export const adminRoutes = {
  root: ADMIN_BASE_PATH,
  login: `${ADMIN_BASE_PATH}/login`,
  overview: `${ADMIN_BASE_PATH}/overview`,
  users: `${ADMIN_BASE_PATH}/users`,
  verification: `${ADMIN_BASE_PATH}/verification`,
  conflicts: `${ADMIN_BASE_PATH}/conflicts`,
  ledger: `${ADMIN_BASE_PATH}/ledger`,
  refunds: `${ADMIN_BASE_PATH}/refunds`,
  controls: `${ADMIN_BASE_PATH}/controls`,
} as const;

export function adminLedgerUrl(userId?: string) {
  if (!userId) return adminRoutes.ledger;
  return `${adminRoutes.ledger}?userId=${encodeURIComponent(userId)}`;
}
