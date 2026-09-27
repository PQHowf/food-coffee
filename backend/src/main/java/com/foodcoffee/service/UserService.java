package com.foodcoffee.service;

import com.foodcoffee.model.User;
import com.foodcoffee.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerOrLogin(String name, String role) {
        return userRepository.findByName(name).map(existingUser -> {
            if (role != null && !role.trim().isEmpty()) {
                existingUser.setRole(role);
                return userRepository.save(existingUser);
            }
            return existingUser;
        }).orElseGet(() -> {
            User newUser = User.builder()
                    .name(name)
                    .role(role != null && !role.trim().isEmpty() ? role : "Thành viên đề xuất")
                    .build();
            return userRepository.save(newUser);
        });
    }

    public Optional<User> getUserByName(String name) {
        return userRepository.findByName(name);
    }

    public User updateUser(String oldName, String newName, String newRole) {
        User user = userRepository.findByName(oldName)
                .orElseThrow(() -> new RuntimeException("User not found: " + oldName));
        user.setName(newName);
        if (newRole != null) {
            user.setRole(newRole);
        }
        return userRepository.save(user);
    }
}
