package com.foodcoffee.controller;

import com.foodcoffee.model.TripPlan;
import com.foodcoffee.repository.TripPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "*")
public class TripPlanController {

    @Autowired
    private TripPlanRepository tripPlanRepository;

    @GetMapping("/user/{userKey}")
    public ResponseEntity<List<TripPlan>> getPlansByUser(@PathVariable String userKey) {
        Long userId = null;
        try {
            userId = Long.parseLong(userKey);
        } catch (NumberFormatException ignored) {}

        List<TripPlan> plans;
        if (userId != null) {
            plans = tripPlanRepository.findByUserIdOrUsername(userId, userKey);
        } else {
            plans = tripPlanRepository.findByUsername(userKey);
        }
        return ResponseEntity.ok(plans);
    }

    @PostMapping
    public ResponseEntity<TripPlan> saveOrUpdatePlan(@RequestBody TripPlan plan) {
        if (plan.getId() == null || plan.getId().trim().isEmpty()) {
            plan.setId("plan_" + System.currentTimeMillis());
        }
        if (plan.getCreatedAt() == null) {
            plan.setCreatedAt(System.currentTimeMillis());
        }
        TripPlan saved = tripPlanRepository.save(plan);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable String id) {
        if (tripPlanRepository.existsById(id)) {
            tripPlanRepository.deleteById(id);
        }
        return ResponseEntity.noContent().build();
    }
}
