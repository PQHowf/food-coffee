package com.foodcoffee.service;

import com.foodcoffee.model.Place;
import com.foodcoffee.repository.PlaceRepository;
import com.foodcoffee.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlaceService {

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void backfillUserIds() {
        try {
            List<Place> placesWithoutUser = placeRepository.findByUserIdIsNull();
            for (Place p : placesWithoutUser) {
                if (p.getSuggestedBy() != null && !p.getSuggestedBy().trim().isEmpty()) {
                    userRepository.findByUsername(p.getSuggestedBy().trim())
                            .or(() -> userRepository.findByName(p.getSuggestedBy().trim()))
                            .ifPresent(u -> {
                                p.setUserId(u.getId());
                                placeRepository.save(p);
                            });
                }
            }
        } catch (Exception e) {
            // bỏ qua lỗi nếu bảng mới khởi tạo
        }
    }

    public List<Place> getAllPlaces(String category, String city, String search) {
        if (search != null && !search.trim().isEmpty()) {
            return placeRepository.findByNameContainingIgnoreCaseOrRecommendedDishContainingIgnoreCaseOrAddressContainingIgnoreCase(
                    search.trim(), search.trim(), search.trim());
        }

        if (category != null && !category.equals("all") && city != null && !city.equals("all")) {
            return placeRepository.findByCategoryAndCity(category, city);
        } else if (category != null && !category.equals("all")) {
            return placeRepository.findByCategory(category);
        } else if (city != null && !city.equals("all")) {
            return placeRepository.findByCity(city);
        }

        return placeRepository.findAll();
    }

    public Optional<Place> getPlaceById(Long id) {
        return placeRepository.findById(id);
    }

    public Place createPlace(Place place) {
        // Tự động gán userId nếu chưa có nhưng có suggestedBy
        if (place.getUserId() == null && place.getSuggestedBy() != null && !place.getSuggestedBy().trim().isEmpty()) {
            userRepository.findByUsername(place.getSuggestedBy().trim())
                    .or(() -> userRepository.findByName(place.getSuggestedBy().trim()))
                    .ifPresent(u -> place.setUserId(u.getId()));
        }
        // Tự động điền suggestedBy nếu có userId mà chưa có suggestedBy
        if (place.getUserId() != null && (place.getSuggestedBy() == null || place.getSuggestedBy().trim().isEmpty())) {
            userRepository.findById(place.getUserId())
                    .ifPresent(u -> place.setSuggestedBy(u.getName()));
        }
        return placeRepository.save(place);
    }

    public Place updatePlace(Long id, Place updatedPlace) {
        return placeRepository.findById(id).map(place -> {
            place.setName(updatedPlace.getName());
            place.setCategory(updatedPlace.getCategory());
            place.setCity(updatedPlace.getCity());
            place.setAddress(updatedPlace.getAddress());
            place.setRecommendedDish(updatedPlace.getRecommendedDish());
            if (updatedPlace.getUserId() != null) {
                place.setUserId(updatedPlace.getUserId());
            }
            if (updatedPlace.getPriceRange() != null) {
                place.setPriceRange(updatedPlace.getPriceRange());
            }
            if (updatedPlace.getImage() != null) {
                place.setImage(updatedPlace.getImage());
            }
            if (updatedPlace.getSuggestedBy() != null) {
                place.setSuggestedBy(updatedPlace.getSuggestedBy());
            }
            return placeRepository.save(place);
        }).orElseThrow(() -> new RuntimeException("Place not found with id: " + id));
    }

    public void deletePlace(Long id) {
        placeRepository.deleteById(id);
    }

    public List<Place> getPlacesByAuthor(String author) {
        return placeRepository.findBySuggestedBy(author);
    }

    public List<Place> getPlacesByUserId(Long userId) {
        return placeRepository.findByUserId(userId);
    }
}
