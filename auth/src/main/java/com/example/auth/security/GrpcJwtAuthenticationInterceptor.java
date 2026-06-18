package com.example.auth.security;

import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.Status;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;
import net.devh.boot.grpc.server.security.interceptors.AuthenticatingServerInterceptor;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import static net.devh.boot.grpc.common.util.InterceptorOrder.ORDER_SECURITY_AUTHENTICATION;

@Component
@GrpcGlobalServerInterceptor
@Order(ORDER_SECURITY_AUTHENTICATION)
public class GrpcJwtAuthenticationInterceptor implements AuthenticatingServerInterceptor {

	private static final Metadata.Key<String> AUTHORIZATION_HEADER =
			Metadata.Key.of("authorization", Metadata.ASCII_STRING_MARSHALLER);
	private static final String BEARER_PREFIX = "Bearer ";

	@Override
	public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
			ServerCall<ReqT, RespT> call,
			Metadata headers,
			ServerCallHandler<ReqT, RespT> next) {
		String fullMethodName = call.getMethodDescriptor().getFullMethodName();
		if (isPublicMethod(fullMethodName) || hasBearerToken(headers)) {
			return next.startCall(call, headers);
		}

		call.close(Status.UNAUTHENTICATED.withDescription("Invalid or missing access token"), new Metadata());
		return new ServerCall.Listener<>() {
		};
	}

	private boolean isPublicMethod(String fullMethodName) {
		return fullMethodName.endsWith("/Register") || fullMethodName.endsWith("/Login");
	}

	private boolean hasBearerToken(Metadata headers) {
		String authorization = headers.get(AUTHORIZATION_HEADER);
		if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
			return false;
		}

		String token = authorization.substring(BEARER_PREFIX.length());
		return !token.isBlank();
	}
}
