import type {
  AdminUser,
  SystemUser,
  UserVerificationDetail,
  UserVerificationRecord,
  UserVerificationStatus,
} from "./user";
import type { ConflictItem, ResolutionAction } from "./conflict";
import type { AdminPlatformData, BooleanOptionMap } from "./admin-data";
import type { RefundOrderDetail, RefundOrderListItem } from "./refund";
import type { SystemInfo } from "./system";
import type { TicketDetail, TicketLedgerRecord, TicketListItem, TicketRoomThread } from "./ticket";

export type SystemUsersApiResponse = {
  success: boolean;
  data: SystemUser[];
};

export type VerificationUsersResponse = {
  verifications: UserVerificationRecord[];
  total: number;
};

export type VerificationsApiResponse = {
  success: boolean;
  data: UserVerificationRecord[];
};

export type VerificationDetailApiResponse = {
  success: boolean;
  data: UserVerificationDetail;
};

export type UpdateUserVerificationRequest = {
  userId: string;
  status: UserVerificationStatus;
};

export type UpdateUserVerificationResponse = {
  user: AdminUser;
};

export type ConflictsResponse = {
  conflicts: ConflictItem[];
  total: number;
  open: number;
  resolved: number;
  escalated: number;
};

export type ResolveConflictRequest = {
  conflictId: string;
  action: ResolutionAction;
  notes?: string;
};

export type ResolveConflictResponse = {
  conflict: ConflictItem;
};

export type SystemInfoApiResponse = {
  success: boolean;
  data: SystemInfo;
};

export type AdminDataApiResponse = {
  success: boolean;
  data: AdminPlatformData;
};

export type AdminStringListApiResponse = {
  success: boolean;
  data: string[];
};

export type AdminBooleanMapApiResponse = {
  success: boolean;
  data: BooleanOptionMap;
};

export type TicketsApiResponse = {
  success: boolean;
  data: TicketListItem[];
};

export type TicketDetailApiResponse = {
  success: boolean;
  data: TicketDetail;
};

export type TicketRoomMessagesApiResponse = {
  success: boolean;
  data: TicketRoomThread[];
};

export type TicketLedgerApiResponse = {
  success: boolean;
  data: TicketLedgerRecord;
};

export type RefundOrdersApiResponse = {
  success: boolean;
  data: RefundOrderListItem[];
};

export type RefundOrderDetailApiResponse = {
  success: boolean;
  data: RefundOrderDetail;
};
