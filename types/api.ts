export type User = {
  id: string;
  email: string;
  name?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user?: User;
};

export type Session = {
  id: string;
  user_id: string;
  title: string;
  car_context: string;
  vehicle_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MessageRole = "user" | "assistant" | "system";

export type Message = {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
};

export type CreateSessionRequest = {
  title?: string | null;
  vehicle_id?: string | null;
  car_context?: string;
};

export type SendMessageRequest = {
  message: string;
  car_context?: string;
  vehicle_id?: string | null;
  title?: string | null;
  use_user_manual?: boolean;
};

export type SendMessageResponse = {
  session: Session;
  user_message: Message;
  assistant_message: Message;
};

export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation"
  | "rate_limited"
  | "server_error"
  | "unavailable"
  | "network"
  | "unknown";
