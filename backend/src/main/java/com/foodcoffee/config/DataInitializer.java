package com.foodcoffee.config;

import com.foodcoffee.model.Place;
import com.foodcoffee.model.User;
import com.foodcoffee.repository.PlaceRepository;
import com.foodcoffee.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(PlaceRepository placeRepository, UserRepository userRepository) {
        return args -> {
            try {
                if (userRepository.count() == 0) {
                    userRepository.save(User.builder()
                            .name("Phạm Quốc Huy")
                            .role("Food Reviewer & Coffee Lover")
                            .build());
                }

                if (placeRepository.count() == 0) {
                    placeRepository.save(Place.builder()
                            .name("Phở Thìn Lò Đúc")
                            .category("food")
                            .city("Hà Nội")
                            .district("Hai Bà Trưng")
                            .address("13 Lò Đúc, Ngô Thì Nhậm, Hai Bà Trưng")
                            .recommendedDish("Phở bò tái lăn xào lăn thơm phức, nhiều hành lá")
                            .image("https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80")
                            .suggestedBy("Phạm Quốc Huy")
                            .suggestedByRole("Food Reviewer")
                            .rating(4.8)
                            .reviewCount(420)
                            .tags(List.of("Món nước", "Đặc sản Hà Nội", "Bò tái lăn"))
                            .build());

                    placeRepository.save(Place.builder()
                            .name("Cộng Cà Phê")
                            .category("cafe")
                            .city("Hà Nội")
                            .district("Hoàn Kiếm")
                            .address("116 Cầu Gỗ, Hàng Bạc, Hoàn Kiếm")
                            .recommendedDish("Cà phê cốt dừa thơm béo chuẩn vị Hà Nội")
                            .image("https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80")
                            .suggestedBy("Phạm Quốc Huy")
                            .suggestedByRole("Coffee Lover")
                            .rating(4.7)
                            .reviewCount(530)
                            .tags(List.of("Cốt dừa", "Không gian hoài niệm", "View hồ Gươm"))
                            .build());
                }
            } catch (Exception e) {
                System.out.println("DataInitializer: Bỏ qua tạo seed data vì đã tồn tại hoặc do pooler: " + e.getMessage());
            }
        };
    }
}
