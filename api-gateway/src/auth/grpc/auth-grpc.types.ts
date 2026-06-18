import { Metadata } from '@grpc/grpc-js';
import { Observable } from 'rxjs';

export interface AuthGrpcClient {
  register(request: RegisterGrpcRequest): Observable<RegisterGrpcResponse>;
  login(request: LoginGrpcRequest): Observable<AuthGrpcResponse>;
  getMe(
    request: GetMeGrpcRequest,
    metadata?: Metadata,
  ): Observable<GetMeGrpcResponse>;
}

export interface RegisterGrpcRequest {
  username: string;
  mail: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
}

export interface LoginGrpcRequest {
  mail: string;
  password: string;
}

export interface GetMeGrpcRequest {
  userId: string;
}

export interface RegisterGrpcResponse {
  user?: UserInfoGrpc;
}

export interface AuthGrpcResponse {
  accessToken?: string;
  expired: number | string;
}

export interface GetMeGrpcResponse {
  user?: UserInfoGrpc;
}

export interface UserInfoGrpc {
  userId?: string;
  username?: string;
  mail?: string;
  status?: string;
  profile?: UserProfileGrpc;
  roles?: RoleGrpc[];
}

export interface UserProfileGrpc {
  profileId?: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
}

export interface RoleGrpc {
  roleId?: string;
  roleName?: string;
  description?: string;
}
