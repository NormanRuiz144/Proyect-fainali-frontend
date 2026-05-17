import { ILogin } from "./ilogin";

export interface AuthResponse{
  data: {
    user: ILogin
    token: string
  }
}
