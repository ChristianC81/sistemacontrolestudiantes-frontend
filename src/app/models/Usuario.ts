export interface Usuario {
  _id?: string;
  username: string;
  email: string;
  password?: string; // opcional si no se expone desde el backend
  role: string;
}
export interface AuthResponse {
  message: string;
  token: string;
  user: Usuario;
}

export interface AuthVerifyResponse {
  valid: boolean;
  decoded: {
    userId: string;
    username: string;
    role: string;
    iat: number;
    exp: number;
  };
  user: Usuario;
}
