export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthUser = {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_caretaker: boolean;
};

type LoginResponseData = AuthUser & {
  access_token: string;
};

export type LoginResponse = {
  success: boolean;
  data: LoginResponseData;
};

export type LoginResult = {
  user: AuthUser;
  access_token: string;
};

export type RefreshTokenResponse = {
  success: boolean;
  data: {
    access_token: string;
  };
};
