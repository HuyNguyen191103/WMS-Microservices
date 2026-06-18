package com.example.auth.grpc;

import com.example.auth.exception.AuthUserNotFoundException;
import com.example.auth.exception.MailAlreadyExistsException;
import com.example.auth.grpc.proto.AuthApiGrpc;
import com.example.auth.grpc.proto.AuthResponse;
import com.example.auth.grpc.proto.GetMeRequest;
import com.example.auth.grpc.proto.GetMeResponse;
import com.example.auth.grpc.proto.LoginRequest;
import com.example.auth.grpc.proto.RegisterRequest;
import com.example.auth.grpc.proto.RegisterResponse;
import com.example.auth.service.AuthService;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

import java.util.Objects;
import java.util.UUID;
import java.util.function.Supplier;

@GrpcService
@RequiredArgsConstructor
@Slf4j
public class AuthGrpcService extends AuthApiGrpc.AuthApiImplBase {

	private final AuthService authService;

	@Override
	public void register(RegisterRequest request, StreamObserver<RegisterResponse> responseObserver) {
		unary(responseObserver, () -> authService.register(request));
	}

	@Override
	public void login(LoginRequest request, StreamObserver<AuthResponse> responseObserver) {
		unary(responseObserver, () -> authService.login(request));
	}

	@Override
	public void getMe(GetMeRequest request, StreamObserver<GetMeResponse> responseObserver) {
		unary(responseObserver, () -> authService.getMe(UUID.fromString(request.getUserId())));
	}

	private <T> void unary(StreamObserver<T> responseObserver, Supplier<T> handler) {
		try {
			T response = Objects.requireNonNull(handler.get(), "gRPC response must not be null");
			responseObserver.onNext(response);
			responseObserver.onCompleted();
		} catch (Exception ex) {
			responseObserver.onError(toStatusRuntimeException(ex));
		}
	}

	private StatusRuntimeException toStatusRuntimeException(Exception ex) {
		if (ex instanceof StatusRuntimeException statusRuntimeException) {
			return statusRuntimeException;
		}

		Status status = toStatus(ex);
		if (status.getDescription() == null) {
			status = status.withDescription(safeMessage(ex));
		}
		if (status.getCode() == Status.Code.INTERNAL) {
			log.error("Unhandled Auth gRPC error", ex);
		} else {
			log.warn("Auth gRPC request failed: code={}, message={}", status.getCode(), ex.getMessage());
		}
		return status.asRuntimeException();
	}

	private Status toStatus(Exception ex) {
		if (ex instanceof MailAlreadyExistsException) {
			return Status.ALREADY_EXISTS.withDescription("Mail already exists");
		}
		if (ex instanceof AuthUserNotFoundException) {
			return Status.NOT_FOUND.withDescription("User not found");
		}
		if (ex instanceof AuthenticationException) {
			return Status.UNAUTHENTICATED.withDescription("Unauthenticated");
		}
		if (ex instanceof AccessDeniedException) {
			return Status.PERMISSION_DENIED.withDescription("Permission denied");
		}
		if (ex instanceof IllegalArgumentException) {
			return Status.INVALID_ARGUMENT.withDescription(safeMessage(ex));
		}
		return Status.INTERNAL.withDescription("Auth service request failed");
	}

	private String safeMessage(Exception ex) {
		return ex.getMessage() == null ? "Auth service request failed" : ex.getMessage();
	}

}
