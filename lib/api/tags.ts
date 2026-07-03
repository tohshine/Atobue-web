/**
 * RTK Query cache tag types. Used for automatic cache invalidation.
 */
export const apiTags = {
  user: "User",
  users: "Users",
  system: "System",
  conflict: "Conflict",
  conflicts: "Conflicts",
  ticket: "Ticket",
  tickets: "Tickets",
  refund: "Refund",
  refunds: "Refunds",
  adminData: "AdminData",
} as const;

export type ApiTagType = (typeof apiTags)[keyof typeof apiTags];

export const apiTagTypes: ApiTagType[] = Object.values(apiTags);
