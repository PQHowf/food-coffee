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

    @PostMapping("/login")
    public ResponseEntity<User> loginOrRegister(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String role = payload.get("role");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = userService.registerOrLogin(name.trim(), role);
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
}
