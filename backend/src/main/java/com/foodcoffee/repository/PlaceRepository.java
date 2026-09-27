package com.foodcoffee.repository;

import com.foodcoffee.model.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {
    List<Place> findByCategory(String category);
    List<Place> findByCity(String city);
    List<Place> findByCategoryAndCity(String category, String city);
    List<Place> findBySuggestedBy(String suggestedBy);
    List<Place> findByNameContainingIgnoreCaseOrRecommendedDishContainingIgnoreCaseOrAddressContainingIgnoreCase(
            String name, String dish, String address);
}
