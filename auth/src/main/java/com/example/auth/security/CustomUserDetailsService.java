package com.example.auth.security;

import com.example.auth.entity.AuthUser;
import com.example.auth.repository.AuthUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

	private final AuthUserRepository authUserRepository;

	@Override
	public UserDetails loadUserByUsername(String mail) throws UsernameNotFoundException {
		AuthUser user = authUserRepository.findByMail(mail)
				.orElseThrow(() -> new UsernameNotFoundException("User not found"));
		List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
				.map(role -> new SimpleGrantedAuthority(role.getRoleName()))
				.toList();
		return new CustomUserPrincipal(
				user.getUserId(),
				user.getUsername(),
				user.getMail(),
				user.getPassword(),
				user.getStatus(),
				authorities
		);
	}
}
