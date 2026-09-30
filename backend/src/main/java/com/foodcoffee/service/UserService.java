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

    public User registerUser(String username, String name, String email, String password, String role) {
        String finalUsername = (username != null && !username.trim().isEmpty()) 
                ? username.trim() 
                : ((email != null && !email.trim().isEmpty()) ? email.trim() : (name != null ? name.trim() : "user_" + System.currentTimeMillis()));
        String finalName = (name != null && !name.trim().isEmpty()) ? name.trim() : finalUsername;

        // Tìm user đã tồn tại theo username, email hoặc tên
        Optional<User> existing = userRepository.findByUsername(finalUsername);
        if (existing.isEmpty() && email != null && !email.trim().isEmpty()) {
            existing = userRepository.findByEmail(email.trim());
        }
        if (existing.isEmpty()) {
            existing = userRepository.findByName(finalName);
        }

        if (existing.isPresent()) {
            User user = existing.get();
            if (name != null && !name.trim().isEmpty()) user.setName(name.trim());
            if (email != null && !email.trim().isEmpty()) user.setEmail(email.trim());
            if (password != null && !password.trim().isEmpty()) user.setPassword(password.trim());
            if (role != null && !role.trim().isEmpty()) user.setRole(role.trim());
            return userRepository.save(user);
        }

        User newUser = User.builder()
                .username(finalUsername)
                .name(finalName)
                .email(email != null && !email.trim().isEmpty() ? email.trim() : null)
                .password(password != null && !password.trim().isEmpty() ? password.trim() : null)
                .role(role != null && !role.trim().isEmpty() ? role.trim() : "Thành viên đề xuất")
                .build();
        return userRepository.save(newUser);
    }

    public User loginOrRegister(String username, String name, String email, String password, String role) {
        return registerUser(username, name, email, password, role);
    }

    public User registerOrLogin(String name, String role) {
        return registerUser(name, name, null, null, role);
    }

    public Optional<User> getUserByName(String name) {
        Optional<User> byName = userRepository.findByName(name);
        if (byName.isPresent()) return byName;
        return userRepository.findByUsername(name);
    }

    public User updateUser(String oldName, String newName, String newRole) {
        User user = userRepository.findByName(oldName)
                .or(() -> userRepository.findByUsername(oldName))
                .orElseThrow(() -> new RuntimeException("User not found: " + oldName));
        user.setName(newName);
        if (newRole != null) {
            user.setRole(newRole);
        }
        return userRepository.save(user);
    }

    public boolean changePassword(String usernameOrName, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(usernameOrName)
                .or(() -> userRepository.findByName(usernameOrName))
                .or(() -> userRepository.findByEmail(usernameOrName))
                .orElse(null);
        if (user == null) {
            return false;
        }

        // Kiểm tra mật khẩu hiện tại nếu user đã đặt mật khẩu
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            if (currentPassword == null || !user.getPassword().equals(currentPassword.trim())) {
                return false;
            }
        }

        user.setPassword(newPassword.trim());
        userRepository.save(user);
        return true;
    }
}
