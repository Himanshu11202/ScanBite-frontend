package com.scanbite.backend.repository;

import com.scanbite.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameOrEmailOrMobileNumber(String username, String email, String mobileNumber);
}
