package com.scanbite.backend.controller;

import com.scanbite.backend.model.User;
import com.scanbite.backend.repository.UserRepository;
import com.scanbite.backend.repository.RoleRepository;
import com.scanbite.backend.model.Role;
import com.scanbite.backend.security.JwtProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository, JwtProvider jwtProvider, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
        this.roleRepository = roleRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String mobileNumber = body.get("mobileNumber");
        String password = body.get("password");
        
        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body("Username exists");
        }
        if (email != null && !email.trim().isEmpty() && userRepository.findByUsernameOrEmailOrMobileNumber(email, email, email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        if (mobileNumber != null && !mobileNumber.trim().isEmpty() && userRepository.findByUsernameOrEmailOrMobileNumber(mobileNumber, mobileNumber, mobileNumber).isPresent()) {
            return ResponseEntity.badRequest().body("Mobile number already registered");
        }

        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setMobileNumber(mobileNumber);
        u.setPassword(passwordEncoder.encode(password));
        u.setFullName(body.getOrDefault("fullName", username));

        // Accept optional role field (SUPER_ADMIN, CAFE_ADMIN, CUSTOMER). Default to CUSTOMER.
        String role = body.getOrDefault("role", "CUSTOMER").toUpperCase();
        String roleName;
        switch (role) {
            case "SUPER_ADMIN": roleName = "ROLE_SUPER_ADMIN"; break;
            case "CAFE_ADMIN": roleName = "ROLE_CAFE_ADMIN"; break;
            default: roleName = "ROLE_CUSTOMER";
        }
        Role r = roleRepository.findByName(roleName).orElseGet(() -> roleRepository.save(new Role(roleName)));
        u.getRoles().add(r);
        userRepository.save(u);
        java.util.Set<String> roleNames = u.getRoles().stream().map(Role::getName).collect(java.util.stream.Collectors.toSet());
        return ResponseEntity.ok(Map.of("token", jwtProvider.generateToken(username, roleNames)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        return userRepository.findByUsernameOrEmailOrMobileNumber(username, username, username)
                .map(u -> {
                    if (passwordEncoder.matches(password, u.getPassword())) {
                        java.util.Set<String> roleNames = u.getRoles().stream().map(Role::getName).collect(java.util.stream.Collectors.toSet());
                        return ResponseEntity.ok(Map.of("token", jwtProvider.generateToken(u.getUsername(), roleNames)));
                    } else return ResponseEntity.status(401).body("Invalid credentials");
                }).orElse(ResponseEntity.status(404).body("User not found"));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader(name = "Authorization", required = false) String header) {
        if (header == null || !header.startsWith("Bearer ")) return ResponseEntity.badRequest().body("Missing Authorization header");
        String token = header.substring(7);
        if (!jwtProvider.validateToken(token)) return ResponseEntity.status(401).body("Invalid token");
        String username = jwtProvider.getUsernameFromToken(token);
        java.util.Optional<User> uOpt = userRepository.findByUsername(username);
        if (uOpt.isEmpty()) {
            return ResponseEntity.status(401).body("User not found");
        }
        User u = uOpt.get();
        java.util.Set<String> roleNames = u.getRoles().stream().map(Role::getName).collect(java.util.stream.Collectors.toSet());
        return ResponseEntity.ok(Map.of(
            "id", u.getId(),
            "username", username,
            "email", u.getEmail() != null ? u.getEmail() : "",
            "mobileNumber", u.getMobileNumber() != null ? u.getMobileNumber() : "",
            "roles", roleNames
        ));
    }
}
