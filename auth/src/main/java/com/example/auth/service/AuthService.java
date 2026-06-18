package com.example.auth.service;

import com.example.auth.entity.AuthUser;
import com.example.auth.exception.AuthUserNotFoundException;
import com.example.auth.exception.MailAlreadyExistsException;
import com.example.auth.grpc.proto.AuthResponse;
import com.example.auth.grpc.proto.GetMeResponse;
import com.example.auth.grpc.proto.LoginRequest;
import com.example.auth.grpc.proto.RegisterRequest;
import com.example.auth.grpc.proto.RegisterResponse;
import com.example.auth.grpc.proto.UserInfo;
import com.example.auth.repository.AuthUserRepository;
import com.example.auth.repository.UserProfileRepository;
import com.example.auth.security.CustomUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

	private static final String DEFAULT_STATUS = "ACTIVE";

	private final AuthUserRepository authUserRepository;
	private final UserProfileRepository userProfileRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	@Transactional
	public RegisterResponse register(RegisterRequest request) {
		String username = requireText(request.getUsername(), "Username is required");
		String mail = requireText(normalizeMail(request.getMail()), "Mail is required");
		String password = requireText(request.getPassword(), "Password is required");
		if (authUserRepository.existsByMail(mail)) {
			throw new MailAlreadyExistsException("Mail already exists");
		}

		LocalDateTime now = LocalDateTime.now();
		AuthUser user = new AuthUser();
		user.setUserId(UUID.randomUUID());
		user.setUsername(username);
		user.setMail(mail);
		user.setPassword(passwordEncoder.encode(password));
		user.setStatus(DEFAULT_STATUS);
		user.setCreatedAt(now);
		user.setUpdatedAt(now);
		authUserRepository.save(user);

		com.example.auth.entity.UserProfile profile = new com.example.auth.entity.UserProfile();
		profile.setProfileId(UUID.randomUUID());
		profile.setPhoneNumber(request.getPhoneNumber());
		profile.setAddress(request.getAddress());
		profile.setDepartment(request.getDepartment());
		profile.setUser(user);
		profile.setCreatedAt(now);
		profile.setUpdatedAt(now);
		userProfileRepository.save(profile);

		return RegisterResponse.newBuilder()
				.setUser(toUserInfo(user, profile, List.of()))
				.build();
	}

	@Transactional(readOnly = true)
	public AuthResponse login(LoginRequest request) {
		String mail = requireText(normalizeMail(request.getMail()), "Mail is required");
		String password = requireText(request.getPassword(), "Password is required");
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(mail, password)
		);

		CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
		List<String> roleNames = principal.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.toList();
		String token = jwtService.generateAccessToken(
				principal.getUserId(),
				principal.getDisplayUsername(),
				principal.getMail(),
				roleNames
		);
		return AuthResponse.newBuilder()
				.setAccessToken(token)
				.setExpired(jwtService.getExpired())
				.build();
	}

	@Transactional(readOnly = true)
	public GetMeResponse getMe(UUID userId) {
		AuthUser user = authUserRepository.findById(userId)
				.orElseThrow(() -> new AuthUserNotFoundException("User not found"));
		com.example.auth.entity.UserProfile profile = userProfileRepository.findByUser(user).orElse(null);
		return GetMeResponse.newBuilder()
				.setUser(toUserInfo(user, profile, findRoles(user)))
				.build();
	}

	private List<com.example.auth.entity.Role> findRoles(AuthUser user) {
		return user.getRoles().stream().toList();
	}

	private UserInfo toUserInfo(
			AuthUser user,
			com.example.auth.entity.UserProfile profile,
			List<com.example.auth.entity.Role> roles) {
		UserInfo.Builder builder = UserInfo.newBuilder()
				.setUserId(user.getUserId().toString())
				.setUsername(user.getUsername())
				.setMail(user.getMail())
				.setStatus(user.getStatus());
		if (profile != null) {
			builder.setProfile(toUserProfile(profile));
		}
		roles.forEach(role -> builder.addRoles(toRole(role)));
		return builder.build();
	}

	private com.example.auth.grpc.proto.UserProfile toUserProfile(com.example.auth.entity.UserProfile profile) {
		return com.example.auth.grpc.proto.UserProfile.newBuilder()
				.setProfileId(profile.getProfileId().toString())
				.setPhoneNumber(nullToEmpty(profile.getPhoneNumber()))
				.setAddress(nullToEmpty(profile.getAddress()))
				.setDepartment(nullToEmpty(profile.getDepartment()))
				.build();
	}

	private com.example.auth.grpc.proto.Role toRole(com.example.auth.entity.Role role) {
		return com.example.auth.grpc.proto.Role.newBuilder()
				.setRoleId(role.getRoleId().toString())
				.setRoleName(role.getRoleName())
				.setDescription(nullToEmpty(role.getDescription()))
				.build();
	}

	private String normalizeMail(String mail) {
		return mail == null ? null : mail.trim().toLowerCase();
	}

	private String requireText(String value, String message) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException(message);
		}
		return value;
	}

	private String nullToEmpty(String value) {
		return value == null ? "" : value;
	}
}
