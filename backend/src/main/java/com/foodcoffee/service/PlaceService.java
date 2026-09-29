package com.foodcoffee.service;

import com.foodcoffee.model.Place;
import com.foodcoffee.repository.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlaceService {

    @Autowired
    private PlaceRepository placeRepository;

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
        return placeRepository.save(place);
    }

    public Place updatePlace(Long id, Place updatedPlace) {
        return placeRepository.findById(id).map(place -> {
            place.setName(updatedPlace.getName());
            place.setCategory(updatedPlace.getCategory());
            place.setCity(updatedPlace.getCity());
            place.setAddress(updatedPlace.getAddress());
            place.setRecommendedDish(updatedPlace.getRecommendedDish());
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
}
