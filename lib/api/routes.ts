/**
 * Single source of truth for API paths.
 * Update paths here when the backend contract changes.
 */
export const apiRoutes = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
  },
  system: {
    info: "/admin/system/",
    verifications: "/admin/system/verifications",
    verificationDetail: (id: string) => `/admin/system/verifications/${id}`,
  },
  users: {
    list: "/admin/system/users",
    verificationList: "/admin/system/verifications",
    verification: (userId: string) => `/api/users/${userId}/verification`,
  },
  conflicts: {
    list: "/api/conflicts",
    resolve: (conflictId: string) => `/api/conflicts/${conflictId}/resolve`,
  },
  tickets: {
    list: "/admin/tickets",
    detail: (ticketId: string) => `/admin/tickets/${ticketId}`,
    roomMessages: (roomId: string) => `/admin/tickets/rooms/${roomId}/messages`,
    ledger: (ledgerId: string) => `/admin/tickets/ledger/${ledgerId}`,
  },
  refunds: {
    list: "/admin/orders/refunds",
    detail: (orderId: string) => `/admin/orders/refunds/${orderId}`,
  },
  adminData: {
    // Public catalog reads (no /admin prefix)
    amenities: "/data/amenities",
    unitCategories: "/data/unit-categories",
    durations: "/data/durations",
    services: "/data/services",
    // Admin writes — path is /admin/... only; proxy base is already https://api.xelfcon.com/api
    // → POST https://api.xelfcon.com/api/admin/data/add-data
    // → PUT  https://api.xelfcon.com/api/admin/data/remove-data
    add: "/admin/data/add-data",
    remove: "/admin/data/remove-data",
  },
} as const;
