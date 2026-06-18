package com.example.auth.service;

import com.example.auth.config.JwtProperties;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class JwtService {

	private final JwtProperties jwtProperties;
	private final PrivateKey privateKey;

	public JwtService(JwtProperties jwtProperties) {
		this.jwtProperties = jwtProperties;
		this.privateKey = loadPrivateKey(jwtProperties.privateKeyPath());
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
}
