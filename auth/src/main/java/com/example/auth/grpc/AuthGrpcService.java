package com.example.auth.grpc;

import com.example.auth.grpc.proto.AuthApiGrpc;
import com.example.auth.grpc.proto.AuthResponse;
import com.example.auth.grpc.proto.GetMeRequest;
import com.example.auth.grpc.proto.GetMeResponse;
import com.example.auth.grpc.proto.LoginRequest;
import com.example.auth.grpc.proto.RegisterRequest;
import com.example.auth.grpc.proto.RegisterResponse;
import com.example.auth.grpc.proto.ValidateAccessTokenRequest;
import com.example.auth.grpc.proto.ValidateAccessTokenResponse;
import com.example.auth.security.CustomUserPrincipal;
import com.example.auth.service.AuthService;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@GrpcService
@RequiredArgsConstructor
public class AuthGrpcService extends AuthApiGrpc.AuthApiImplBase {

	private final AuthService authService;

	@Override
	public void register(RegisterRequest request, StreamObserver<RegisterResponse> responseObserver) {
		responseObserver.onNext(authService.register(request));
		responseObserver.onCompleted();
	}

	@Override
	public void login(LoginRequest request, StreamObserver<AuthResponse> responseObserver) {
		responseObserver.onNext(authService.login(request));
		responseObserver.onCompleted();
	}

	@Override
	public void validateAccessToken(ValidateAccessTokenRequest request,
			StreamObserver<ValidateAccessTokenResponse> responseObserver) {
		CustomUserPrincipal principal = currentPrincipal();
		responseObserver.onNext(ValidateAccessTokenResponse.newBuilder()
				.setValid(true)
				.setUserId(principal.getUserId().toString())
				.setUsername(principal.getDisplayUsername())
				.setMail(principal.getMail())
				.addAllRoles(currentRoles(principal))
				.build());
		responseObserver.onCompleted();
	}

	@Override
	public void getMe(GetMeRequest request, StreamObserver<GetMeResponse> responseObserver) {
		responseObserver.onNext(authService.getMe(currentPrincipal().getUserId()));
		responseObserver.onCompleted();
	}

	private CustomUserPrincipal currentPrincipal() {
		return (CustomUserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	}

	private List<String> currentRoles(CustomUserPrincipal principal) {
		return principal.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.toList();
	}

}
