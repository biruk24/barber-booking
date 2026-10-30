package com.barberbooking.repository;

import com.barberbooking.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Find a user using their email address.
    Optional<User> findByEmail(String email);

    // Check whether an email is already registered.
    boolean existsByEmail(String email);

    // Check whether a phone number is already registered.
    boolean existsByPhone(String phone);
}