package com.healthmate.repository;

import com.healthmate.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByVerifiedFalseAndOtpGeneratedAtBefore(LocalDateTime cutoff);
}
