export type SystemCashMetrics = {
  completed_inflow: number;
  completed_outflow: number;
  net_cashflow: number;
  pending_refund_exposure: number;
  account_balance: number;
};

export type SystemUserMetrics = {
  total_users: number;
  active_users: number;
};

export type SystemInfo = {
  cash: SystemCashMetrics;
  users: SystemUserMetrics;
  _id: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};
