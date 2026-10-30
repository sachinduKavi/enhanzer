export interface LoginRequest {
  API_Action: 'GetLoginData';
  Device_Id: string;
  Sync_Time: string;
  Company_Code: string;
  API_Body: {
    Username: string;
    Pw: string;
  };
}

export interface UserLocation {
  Location_Code: string;
  Location_Name: string;
}

export interface LoginUser {
  User_Display_Name?: string;
  Email: string;
  User_Locations?: UserLocation[];
  Doc_Msg?: string;
}

export interface LoginResponse {
  Status_Code: number;
  Message: string;
  Response_Body: LoginUser[] | null;
}

export interface AuthSession {
  email: string;
  displayName: string;
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password.');
  }
}
