package com.example.auth.repository;

import com.example.auth.entity.AuthUser;
import com.example.auth.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {

	Optional<UserProfile> findByUser(AuthUser user);
}
