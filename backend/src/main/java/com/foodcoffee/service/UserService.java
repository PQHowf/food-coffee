package com.foodcoffee.service;

import com.foodcoffee.model.Place;
import com.foodcoffee.model.User;
import com.foodcoffee.repository.PlaceRepository;
import com.foodcoffee.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlaceRepository placeRepository;

    public User registerUser(String username, String name, String email, String password, String role, String avatar) {
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
            if (avatar != null) user.setAvatar(avatar.trim());
            return userRepository.save(user);
        }

        User newUser = User.builder()
                .username(finalUsername)
                .name(finalName)
                .email(email != null && !email.trim().isEmpty() ? email.trim() : null)
                .password(password != null && !password.trim().isEmpty() ? password.trim() : null)
                .role(role != null && !role.trim().isEmpty() ? role.trim() : "Thành viên đề xuất")
                .avatar(avatar != null && !avatar.trim().isEmpty() ? avatar.trim() : null)
                .build();
        return userRepository.save(newUser);
    }

    public User registerUser(String username, String name, String email, String password, String role) {
        return registerUser(username, name, email, password, role, null);
    }

    public User loginOrRegister(String username, String name, String email, String password, String role) {
        return registerUser(username, name, email, password, role, null);
    }

    public User loginOrRegister(String username, String name, String email, String password, String role, String avatar) {
        return registerUser(username, name, email, password, role, avatar);
    }

    public User registerOrLogin(String name, String role) {
        return registerUser(name, name, null, null, role, null);
    }

    public Optional<User> getUserByName(String nameOrId) {
        if (nameOrId == null || nameOrId.trim().isEmpty()) return Optional.empty();
        try {
            Long id = Long.parseLong(nameOrId.trim());
            Optional<User> byId = userRepository.findById(id);
            if (byId.isPresent()) return byId;
        } catch (NumberFormatException ignored) {}
        Optional<User> byName = userRepository.findByName(nameOrId.trim());
        if (byName.isPresent()) return byName;
        return userRepository.findByUsername(nameOrId.trim());
    }

    public User updateUser(String oldName, String newName, String newRole, String avatar) {
        User user = userRepository.findByName(oldName)
                .or(() -> userRepository.findByUsername(oldName))
                .orElseThrow(() -> new RuntimeException("User not found: " + oldName));
        user.setName(newName);
        if (newRole != null) {
            user.setRole(newRole);
        }
        if (avatar != null) {
            user.setAvatar(avatar.isEmpty() ? null : avatar);
        }
        User saved = userRepository.save(user);

        // Đồng bộ tên tác giả và avatar sang các quán cũ
        try {
            List<Place> places = placeRepository.findBySuggestedBy(oldName);
            for (Place p : places) {
                p.setSuggestedBy(newName);
                if (avatar != null) {
                    p.setAuthorAvatar(avatar.isEmpty() ? null : avatar);
                }
                placeRepository.save(p);
            }
        } catch (Exception ignored) {}

        return saved;
    }

    public User updateUser(String oldName, String newName, String newRole) {
        return updateUser(oldName, newName, newRole, null);
    }

    public User updateAvatar(String usernameOrName, String avatar) {
        if (usernameOrName == null || usernameOrName.trim().isEmpty()) {
            throw new IllegalArgumentException("Username or name must not be empty");
        }
        User user = null;
        try {
            Long id = Long.parseLong(usernameOrName.trim());
            user = userRepository.findById(id).orElse(null);
        } catch (NumberFormatException ignored) {}
        if (user == null) {
            user = userRepository.findByUsername(usernameOrName.trim())
                    .or(() -> userRepository.findByName(usernameOrName.trim()))
                    .or(() -> userRepository.findByEmail(usernameOrName.trim()))
                    .orElseThrow(() -> new RuntimeException("User not found: " + usernameOrName));
        }

        String finalAvatar = (avatar != null && !avatar.trim().isEmpty()) ? avatar.trim() : null;
        user.setAvatar(finalAvatar);
        User savedUser = userRepository.save(user);

        // Đồng bộ avatar sang tất cả quán do người này đăng
        try {
            if (savedUser.getId() != null) {
                List<Place> places = placeRepository.findByUserId(savedUser.getId());
                for (Place p : places) {
                    p.setAuthorAvatar(finalAvatar);
                    placeRepository.save(p);
                }
            }
            if (savedUser.getName() != null) {
                List<Place> placesByName = placeRepository.findBySuggestedBy(savedUser.getName());
                for (Place p : placesByName) {
                    p.setAuthorAvatar(finalAvatar);
                    placeRepository.save(p);
                }
            }
        } catch (Exception e) {
            System.err.println("Cảnh báo: Lỗi đồng bộ avatar sang quán: " + e.getMessage());
        }

        return savedUser;
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
