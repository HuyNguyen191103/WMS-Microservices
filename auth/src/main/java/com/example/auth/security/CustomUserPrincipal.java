package com.example.auth.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.UUID;

public class CustomUserPrincipal implements UserDetails {

	private final UUID userId;
	private final String username;
	private final String mail;
	private final String password;
	private final String status;
	private final Collection<? extends GrantedAuthority> authorities;

	public CustomUserPrincipal(UUID userId, String username, String mail, String password, String status,
			Collection<? extends GrantedAuthority> authorities) {
		this.userId = userId;
		this.username = username;
		this.mail = mail;
		this.password = password;
		this.status = status;
		this.authorities = authorities;
	}

	public UUID getUserId() {
		return userId;
	}

	public String getMail() {
		return mail;
	}

	public String getDisplayUsername() {
		return username;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return mail;
	}

	@Override
	public boolean isEnabled() {
		return "ACTIVE".equalsIgnoreCase(status);
	}
}
