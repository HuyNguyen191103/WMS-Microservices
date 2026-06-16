package com.example.auth.service;

import com.example.auth.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPrivateCrtKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.RSAPublicKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class JwtService {

	private final JwtProperties jwtProperties;
	private final PrivateKey privateKey;
	private final PublicKey publicKey;

	public JwtService(JwtProperties jwtProperties) {
		this.jwtProperties = jwtProperties;
		this.privateKey = loadPrivateKey(jwtProperties.privateKeyPath());
		this.publicKey = derivePublicKey(privateKey);
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
				.signWith(privateKey, Jwts.SIG.RS256)
				.compact();
	}

	public Claims parseClaims(String token) {
		return Jwts.parser()
				.verifyWith(publicKey)
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

	private PrivateKey loadPrivateKey(String privateKeyPath) {
		try {
			String pem = Files.readString(Path.of(privateKeyPath));
			String base64 = pem
					.replace("-----BEGIN PRIVATE KEY-----", "")
					.replace("-----END PRIVATE KEY-----", "")
					.replaceAll("\\s", "");
			byte[] keyBytes = Base64.getDecoder().decode(base64);
			PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
			return KeyFactory.getInstance("RSA").generatePrivate(keySpec);
		} catch (Exception ex) {
			throw new IllegalStateException("Unable to load JWT private key", ex);
		}
	}

	private PublicKey derivePublicKey(PrivateKey privateKey) {
		try {
			if (!(privateKey instanceof RSAPrivateCrtKey rsaPrivateKey)) {
				throw new IllegalArgumentException("JWT private key must be an RSA private key");
			}

			RSAPublicKeySpec keySpec = new RSAPublicKeySpec(
					rsaPrivateKey.getModulus(),
					rsaPrivateKey.getPublicExponent()
			);
			return KeyFactory.getInstance("RSA").generatePublic(keySpec);
		} catch (Exception ex) {
			throw new IllegalStateException("Unable to derive JWT public key", ex);
		}
	}
}
