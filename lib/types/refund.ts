export type RefundStatus = "cleared" | "pending" | "processing" | "failed" | (string & {});

export type RefundBreakdown = {
  commitment_amount: number;
  refund_amount: number;
  platform_fee: number;
  refund_percentage: number;
  currency: string;
  commitment_payment_id: string;
  decline_reason: string | null;
};

export type RefundOrderListItem = {
  _id: string;
  id: string;
  from: string | RefundUserProfile;
  payment_id: string;
  type: string;
  vacancy_id: string | RefundVacancyReference;
  enquiry_id: string;
  status: RefundStatus;
  amount: number;
  success_time: string;
  resolve_after: string;
  breakdown: RefundBreakdown;
  admin_action: string | null;
  createdAt: string;
  updatedAt: string;
  clearance_time: string | null;
};

export type RefundUserProfile = {
  _id: string;
  profile_photo: string;
  first_name: string;
  last_name: string;
  fullname: string;
  id: string;
};

export type RefundVacancyReference = {
  _id: string;
  title: string;
  id: string;
};

export type RefundOrderDetail = {
  _id: string;
  id: string;
  from: RefundUserProfile;
  payment_id: string;
  type: string;
  vacancy_id: RefundVacancyReference | null;
  enquiry_id: string;
  status: RefundStatus;
  amount: number;
  success_time: string;
  resolve_after: string;
  breakdown: RefundBreakdown;
  admin_action: string | null;
  createdAt: string;
  updatedAt: string;
  clearance_time: string | null;
};
