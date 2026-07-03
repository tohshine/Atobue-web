export type TicketType = "decline_commitment" | (string & {});
export type TicketStatus =
  | "open"
  | "resolved"
  | "closed"
  | "in_review"
  | "escalated"
  | (string & {});
export type TicketPriority = "low" | "medium" | "high" | "urgent" | (string & {});

export type TicketListUsers = {
  for: string;
  against: string;
};

export type TicketListItem = {
  _id: string;
  ticket_number: string;
  title: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  user_id: string;
  users: TicketListUsers;
};

export type TicketParty = {
  _id: string;
  fullname: string;
  email: string;
  tel: string;
  status: string;
};

export type TicketProperty = {
  _id: string;
  name: string;
  title: string;
  location: string;
};

export type TicketVacancy = {
  _id: string;
  title: string;
  rent: number;
  rent_duration: string;
  listing_type: string;
  unit_number: string;
  status: string;
};

export type TicketEnquiry = {
  _id: string;
  status: string;
  decline_reason: string | null;
  expires: string | null;
  commitment_paid: boolean;
  commitment_paid_at: string | null;
};

export type TicketPayment = {
  _id: string;
  reference: string;
  amount_paid: number;
  currency: string;
  status: string;
  type: string;
  success_time: string | null;
};

export type TicketLedgerRefs = {
  reporter: string | null;
  against: string | null;
  caretaker: string | null;
};

export type TicketRoomMessage = {
  _id: string;
  senderId: string;
  roomId: string;
  text: string;
  type: string;
  message_type: string;
  read: string[];
  attachments: unknown[];
  sending_time: string;
  update_time: string;
  isYou: boolean;
};

export type TicketRoomThread = {
  _id: string;
  participants: string[];
  messages: TicketRoomMessage[];
  sending_time: string;
  update_time: string;
  attachments_data: unknown[];
  vacancy_data: unknown[];
};

export type TicketLedgerSummary = {
  _id: string;
  total_money_in: number;
  total_money_out: number;
  entry_count: number;
  first_entry_at: string | null;
  last_entry_at: string | null;
};

export type TicketLedgerPayment = {
  _id: string;
  type: string;
  status: string;
  currency: string;
  reference: string;
  amount_paid: number;
  success_time: string | null;
};

export type TicketLedgerHistoryItem = {
  _id: string;
  user_id: string;
  payment_id: string | null;
  type: string;
  moneyIn: number;
  moneyOut: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  payment: TicketLedgerPayment | null;
};

export type TicketLedgerRecord = {
  summary: TicketLedgerSummary;
  history: TicketLedgerHistoryItem[];
};

export type TicketDetail = {
  _id: string;
  ticket_number: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  admin_notes: string | null;
  createdAt: string;
  reporter: TicketParty | null;
  against: TicketParty | null;
  caretaker: TicketParty | null;
  property: TicketProperty | null;
  vacancy: TicketVacancy | null;
  enquiry: TicketEnquiry | null;
  payment: TicketPayment | null;
  room_id: string | null;
  ledger_refs: TicketLedgerRefs | null;
};
