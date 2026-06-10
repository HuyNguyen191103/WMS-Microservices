package com.example.auth.repository;

import com.example.auth.entity.AuthUser;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuthUserRepository extends JpaRepository<AuthUser, UUID> {

	@EntityGraph(attributePaths = "roles")
	Optional<AuthUser> findByMail(String mail);

	boolean existsByMail(String mail);
}
