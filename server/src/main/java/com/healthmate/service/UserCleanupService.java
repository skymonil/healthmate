package com.healthmate.service;

import com.healthmate.repository.UserRepository;
import com.healthmate.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserCleanupService {

    @Autowired
    private UserRepository userRepository;

    @Scheduled(fixedRate = 300000)
    public void removeExpiredUnverifiedUsers() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);

        List<User> expiredUsers = userRepository.findByVerifiedFalseAndOtpGeneratedAtBefore(cutoff);

        if (!expiredUsers.isEmpty()) {
            userRepository.deleteAll(expiredUsers);
            System.out.println("Cleanup job removed " + expiredUsers.size() + " expired users.");
        }
    }
}
