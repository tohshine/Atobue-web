import type {
  AdminUser,
  SystemUser,
  UserVerificationDetail,
  UserVerificationRecord,
  UserVerificationStatus,
} from "./user";
import type { ConflictItem, ResolutionAction } from "./conflict";
import type { SystemInfo } from "./system";

export type SystemUsersApiResponse = {
  success: boolean;
  data: SystemUser[];
};

export type UsersResponse = {
  users: SystemUser[];
  total: number;
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
