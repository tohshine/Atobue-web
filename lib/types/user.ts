export type UserVerificationStatus = "pending" | "approved" | "denied";

export type DocsVerificationStatus = "accepted" | "pending" | "rejected" | "denied";

export type VerificationAction = "hold" | "accept";

export type VerificationUserInfo = {
  first_name: string;
  last_name: string;
  fullname: string;
  _id: string;
};

export type UserVerificationRecord = {
  _id: string;
  user_info: VerificationUserInfo;
  file_type: string;
  docs_verification_status: DocsVerificationStatus;
};

export type UserVerificationDetail = {
  _id: string;
  user_id: string;
  file_type: string;
  docs_verification_status: DocsVerificationStatus;
  admin_action: string | null;
  viewUrl: string;
};

export type SystemUserInfo = {
  first_name: string;
  last_name: string;
  fullname: string;
  email: string;
  _id: string;
  createdAt: string;
  currency: string;
};

export type SystemUserCash = {
  inflow: string;
  outflow: string;
  total_inflow: string;
};

export type SystemUser = {
  user_info: SystemUserInfo;
  cash: SystemUserCash;
};

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: "tenant" | "landlord" | "caretaker" | "admin";
  status: "active" | "inactive" | "suspended";
  joinedAt: string;
  lastSeen: string;
  totalTransactions: number;
  documentType: "national-id" | "passport" | "drivers-license";
  documentUrl: string;
  documentUploadedAt: string;
  verificationStatus: UserVerificationStatus;
};
