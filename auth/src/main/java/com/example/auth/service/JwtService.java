package com.example.auth.service;

import com.example.auth.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class JwtService {

	private final JwtProperties jwtProperties;
	private final SecretKey secretKey;

	public JwtService(JwtProperties jwtProperties) {
		this.jwtProperties = jwtProperties;
		this.secretKey = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
	}

	public String generateAccessToken(UUID userId, String username, String mail, List<String> roles) {
		Instant now = Instant.now();
		return Jwts.builder()
				.subject(mail)
				.claim("userId", userId.toString())
				.claim("username", username)
				.claim("roles", roles)
				.issuedAt(Date.from(now))
				.expiration(Date.from(now.plusMillis(jwtProperties.expired())))
				.signWith(secretKey)
				.compact();
	}

	public Claims parseClaims(String token) {
		return Jwts.parser()
				.verifyWith(secretKey)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	public boolean isValid(String token) {
		try {
			parseClaims(token);
			return true;
		} catch (RuntimeException ex) {
			return false;
		}
	}

	public String extractMail(String token) {
		return parseClaims(token).getSubject();
	}

	public long getExpired() {
		return jwtProperties.expired();
	}
}
