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
} as const;
