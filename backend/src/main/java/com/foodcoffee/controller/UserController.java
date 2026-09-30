package com.foodcoffee.controller;

import com.foodcoffee.model.User;
import com.foodcoffee.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String name = payload.get("name");
        String email = payload.get("email");
        String password = payload.get("password");
        String role = payload.get("role");

        if ((username == null || username.trim().isEmpty()) && (name == null || name.trim().isEmpty()) && (email == null || email.trim().isEmpty())) {
            return ResponseEntity.badRequest().build();
        }

        User user = userService.registerUser(username, name, email, password, role);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<User> loginOrRegister(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String name = payload.get("name");
        String email = payload.get("email");
        String password = payload.get("password");
        String role = payload.get("role");

        String identifier = username != null && !username.trim().isEmpty() ? username.trim() : (name != null ? name.trim() : email);

        if (identifier == null || identifier.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = userService.loginOrRegister(username, name, email, password, role);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{name}")
    public ResponseEntity<User> getUserProfile(@PathVariable String name) {
        return userService.getUserByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{oldName}")
    public ResponseEntity<User> updateUser(
            @PathVariable String oldName,
            @RequestBody Map<String, String> payload) {
        String newName = payload.get("name");
        String newRole = payload.get("role");

        if (newName == null || newName.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User updated = userService.updateUser(oldName, newName.trim(), newRole);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        if (username == null || newPassword == null || newPassword.trim().length() < 4) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu mới phải từ 4 ký tự trở lên"));
        }

        boolean success = userService.changePassword(username.trim(), currentPassword, newPassword.trim());
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu hiện tại không chính xác"));
        }
    }
}
