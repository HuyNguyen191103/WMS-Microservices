package com.example.auth.security;

import com.example.auth.service.JwtService;
import io.grpc.ForwardingServerCallListener;
import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.Status;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;
import net.devh.boot.grpc.server.security.interceptors.AuthenticatingServerInterceptor;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import static net.devh.boot.grpc.common.util.InterceptorOrder.ORDER_SECURITY_AUTHENTICATION;

@Component
@GrpcGlobalServerInterceptor
@Order(ORDER_SECURITY_AUTHENTICATION)
public class GrpcJwtAuthenticationInterceptor implements AuthenticatingServerInterceptor {

	private static final Metadata.Key<String> AUTHORIZATION_HEADER =
			Metadata.Key.of("authorization", Metadata.ASCII_STRING_MARSHALLER);
	private static final String BEARER_PREFIX = "Bearer ";

	private final JwtService jwtService;
	private final CustomUserDetailsService customUserDetailsService;

	public GrpcJwtAuthenticationInterceptor(JwtService jwtService, CustomUserDetailsService customUserDetailsService) {
		this.jwtService = jwtService;
		this.customUserDetailsService = customUserDetailsService;
	}

	@Override
	public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
			ServerCall<ReqT, RespT> call,
			Metadata headers,
			ServerCallHandler<ReqT, RespT> next) {
		if (isPublicMethod(call.getMethodDescriptor().getFullMethodName())) {
			return next.startCall(call, headers);
		}

		String token = resolveBearerToken(headers);
		if (token == null || !jwtService.isValid(token)) {
			call.close(Status.UNAUTHENTICATED.withDescription("Invalid or missing access token"), new Metadata());
			return new ServerCall.Listener<>() {
			};
		}

		UserDetails userDetails;
		try {
			userDetails = customUserDetailsService.loadUserByUsername(jwtService.extractMail(token));
		} catch (UsernameNotFoundException ex) {
			call.close(Status.UNAUTHENTICATED.withDescription("Invalid access token"), new Metadata());
			return new ServerCall.Listener<>() {
			};
		}
		if (!userDetails.isEnabled()) {
			call.close(Status.PERMISSION_DENIED.withDescription("User is disabled"), new Metadata());
			return new ServerCall.Listener<>() {
			};
		}

		UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
				userDetails,
				null,
				userDetails.getAuthorities()
		);
		SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
		securityContext.setAuthentication(authentication);

		SecurityContextHolder.setContext(securityContext);
		try {
			return new SecurityContextServerCallListener<>(next.startCall(call, headers), securityContext);
		} finally {
			SecurityContextHolder.clearContext();
		}
	}

	private boolean isPublicMethod(String fullMethodName) {
		return fullMethodName.endsWith("/Register") || fullMethodName.endsWith("/Login");
	}

	private String resolveBearerToken(Metadata headers) {
		String authorization = headers.get(AUTHORIZATION_HEADER);
		if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
			return null;
		}
		return authorization.substring(BEARER_PREFIX.length());
	}

	private static class SecurityContextServerCallListener<ReqT>
			extends ForwardingServerCallListener.SimpleForwardingServerCallListener<ReqT> {

		private final SecurityContext securityContext;

		private SecurityContextServerCallListener(ServerCall.Listener<ReqT> delegate, SecurityContext securityContext) {
			super(delegate);
			this.securityContext = securityContext;
		}

		@Override
		public void onMessage(ReqT message) {
			runWithSecurityContext(() -> super.onMessage(message));
		}

		@Override
		public void onHalfClose() {
			runWithSecurityContext(super::onHalfClose);
		}

		@Override
		public void onCancel() {
			runWithSecurityContext(super::onCancel);
		}

		@Override
		public void onComplete() {
			runWithSecurityContext(super::onComplete);
		}

		@Override
		public void onReady() {
			runWithSecurityContext(super::onReady);
		}

		private void runWithSecurityContext(Runnable action) {
			SecurityContextHolder.setContext(securityContext);
			try {
				action.run();
			} finally {
				SecurityContextHolder.clearContext();
			}
		}
	}
}
