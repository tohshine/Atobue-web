/** Obscured admin console path — share only with authorized staff. */
export const ADMIN_BASE_PATH = "/cp-8f3k2m9x7p4q1";

export const adminRoutes = {
  root: ADMIN_BASE_PATH,
  login: `${ADMIN_BASE_PATH}/login`,
  overview: `${ADMIN_BASE_PATH}/overview`,
  users: `${ADMIN_BASE_PATH}/users`,
  verification: `${ADMIN_BASE_PATH}/verification`,
  conflicts: `${ADMIN_BASE_PATH}/conflicts`,
  tickets: `${ADMIN_BASE_PATH}/tickets`,
  ledger: `${ADMIN_BASE_PATH}/ledger`,
  refunds: `${ADMIN_BASE_PATH}/refunds`,
  controls: `${ADMIN_BASE_PATH}/controls`,
} as const;

export function adminLedgerUrl(userId?: string, transactionId?: string) {
  const params = new URLSearchParams();
  if (userId) params.set("ledgerId", userId);
  if (transactionId) params.set("transactionId", transactionId);
  const query = params.toString();
  if (!query) return adminRoutes.ledger;
  return `${adminRoutes.ledger}?${query}`;
}
