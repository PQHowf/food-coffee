package com.foodcoffee.repository;

import com.foodcoffee.model.TripPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripPlanRepository extends JpaRepository<TripPlan, String> {
    List<TripPlan> findByUserId(Long userId);
    List<TripPlan> findByUsername(String username);
    List<TripPlan> findByUserIdOrUsername(Long userId, String username);
}
