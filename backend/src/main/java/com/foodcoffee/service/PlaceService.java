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

    @Autowired
    private FileStorageService fileStorageService;

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

        // Tự động dọn dẹp các đường link ảnh cũ bị mất file do container tạm thời
        try {
            List<Place> allPlaces = placeRepository.findAll();
            for (Place p : allPlaces) {
                String img = p.getImage();
                if (img != null && (img.contains("food-coffee-haag.onrender.com/uploads/") || img.startsWith("/uploads/"))) {
                    String fileName = img.substring(img.lastIndexOf('/') + 1);
                    boolean exists = fileStorageService.imageExists(fileName);
                    if (!exists) {
                        // File ảnh từ container cũ đã mất trên ổ đĩa tạm, đặt null để client hiển thị ảnh category đẹp không bị lỗi 404
                        p.setImage(null);
                        placeRepository.save(p);
                    } else if (img.startsWith("http")) {
                        // Chuẩn hóa thành đường dẫn tương đối /uploads/... để hoạt động tốt với mọi tên miền
                        p.setImage("/uploads/" + fileName);
                        placeRepository.save(p);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Cleanup orphan images: " + e.getMessage());
        }
    }

    public List<Place> getAllPlaces(String category, String city, String search) {
        List<Place> places;
        if (search != null && !search.trim().isEmpty()) {
            places = placeRepository.findByNameContainingIgnoreCaseOrRecommendedDishContainingIgnoreCaseOrAddressContainingIgnoreCase(
                    search.trim(), search.trim(), search.trim());
        } else if (category != null && !category.equals("all") && city != null && !city.equals("all")) {
            places = placeRepository.findByCategoryAndCity(category, city);
        } else if (category != null && !category.equals("all")) {
            places = placeRepository.findByCategory(category);
        } else if (city != null && !city.equals("all")) {
            places = placeRepository.findByCity(city);
        } else {
            places = placeRepository.findAll();
        }

        enrichAuthorAvatars(places);
        return places;
    }

    public Optional<Place> getPlaceById(Long id) {
        Optional<Place> placeOpt = placeRepository.findById(id);
        placeOpt.ifPresent(p -> enrichAuthorAvatars(java.util.Collections.singletonList(p)));
        return placeOpt;
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
        // Tự động gán authorAvatar nếu chưa có
        if (place.getAuthorAvatar() == null || place.getAuthorAvatar().trim().isEmpty()) {
            if (place.getUserId() != null) {
                userRepository.findById(place.getUserId())
                        .filter(u -> u.getAvatar() != null && !u.getAvatar().trim().isEmpty())
                        .ifPresent(u -> place.setAuthorAvatar(u.getAvatar()));
            } else if (place.getSuggestedBy() != null && !place.getSuggestedBy().trim().isEmpty()) {
                userRepository.findByUsername(place.getSuggestedBy().trim())
                        .or(() -> userRepository.findByName(place.getSuggestedBy().trim()))
                        .filter(u -> u.getAvatar() != null && !u.getAvatar().trim().isEmpty())
                        .ifPresent(u -> place.setAuthorAvatar(u.getAvatar()));
            }
        }
        return placeRepository.save(place);
    }

    public void enrichAuthorAvatars(List<Place> places) {
        if (places == null || places.isEmpty()) return;
        List<com.foodcoffee.model.User> users = userRepository.findAll();
        java.util.Map<Long, String> avatarByUserId = new java.util.HashMap<>();
        java.util.Map<String, String> avatarByName = new java.util.HashMap<>();
        for (com.foodcoffee.model.User u : users) {
            if (u.getAvatar() != null && !u.getAvatar().trim().isEmpty()) {
                if (u.getId() != null) avatarByUserId.put(u.getId(), u.getAvatar());
                if (u.getName() != null) avatarByName.put(u.getName().trim().toLowerCase(), u.getAvatar());
                if (u.getUsername() != null) avatarByName.put(u.getUsername().trim().toLowerCase(), u.getAvatar());
            }
        }
        for (Place p : places) {
            String avatar = null;
            if (p.getUserId() != null && avatarByUserId.containsKey(p.getUserId())) {
                avatar = avatarByUserId.get(p.getUserId());
            } else if (p.getSuggestedBy() != null) {
                String key = p.getSuggestedBy().trim().toLowerCase();
                if (avatarByName.containsKey(key)) {
                    avatar = avatarByName.get(key);
                }
            }
            if (avatar != null) {
                p.setAuthorAvatar(avatar);
            }
        }
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
            // Cho phép cập nhật cả khi ảnh rỗng (xóa ảnh)
            place.setImage(updatedPlace.getImage());
            if (updatedPlace.getSuggestedBy() != null) {
                place.setSuggestedBy(updatedPlace.getSuggestedBy());
            }
            if (updatedPlace.getAuthorAvatar() != null) {
                place.setAuthorAvatar(updatedPlace.getAuthorAvatar());
            }
            return placeRepository.save(place);
        }).orElseThrow(() -> new RuntimeException("Place not found with id: " + id));
    }

    public void deletePlace(Long id) {
        placeRepository.deleteById(id);
    }

    public List<Place> getPlacesByAuthor(String author) {
        List<Place> places = placeRepository.findBySuggestedBy(author);
        enrichAuthorAvatars(places);
        return places;
    }

    public List<Place> getPlacesByUserId(Long userId) {
        List<Place> places = placeRepository.findByUserId(userId);
        enrichAuthorAvatars(places);
        return places;
    }
}
