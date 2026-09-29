package com.foodcoffee.config;

import com.foodcoffee.model.Place;
import com.foodcoffee.model.User;
import com.foodcoffee.repository.PlaceRepository;
import com.foodcoffee.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(PlaceRepository placeRepository, UserRepository userRepository, JdbcTemplate jdbcTemplate) {
        return args -> {
            // Tự động xoá các cột và bảng không cần thiết trong database (Supabase PostgreSQL / H2)
            try {
                jdbcTemplate.execute("ALTER TABLE places DROP COLUMN IF EXISTS district;");
                jdbcTemplate.execute("ALTER TABLE places DROP COLUMN IF EXISTS rating;");
                jdbcTemplate.execute("ALTER TABLE places DROP COLUMN IF EXISTS review_count;");
                jdbcTemplate.execute("ALTER TABLE places DROP COLUMN IF EXISTS price;");
                jdbcTemplate.execute("ALTER TABLE places DROP COLUMN IF EXISTS price_display;");
                jdbcTemplate.execute("ALTER TABLE places DROP COLUMN IF EXISTS suggested_by_role;");
                jdbcTemplate.execute("DROP TABLE IF EXISTS place_tags CASCADE;");
                jdbcTemplate.execute("ALTER TABLE places ADD COLUMN IF NOT EXISTS price_range VARCHAR(50);");
                System.out.println("✅ DataInitializer: Đã dọn dẹp và cập nhật cột price_range trong Database thành công!");
            } catch (Exception e) {
                System.out.println("DataInitializer: Bỏ qua dọn dẹp cột thừa: " + e.getMessage());
            }

            try {
                if (userRepository.count() == 0) {
                    userRepository.save(User.builder()
                            .name("Phạm Quốc Huy")
                            .username("quochuy")
                            .email("huy@foodcoffee.vn")
                            .role("Food Reviewer & Coffee Lover")
                            .build());
                }

                if (placeRepository.count() == 0) {
                    placeRepository.save(Place.builder()
                            .name("Phở Thìn Lò Đúc")
                            .category("food")
                            .city("Hà Nội")
                            .priceRange("<100K")
                            .address("13 Lò Đúc, Ngô Thì Nhậm, Hai Bà Trưng")
                            .recommendedDish("Phở bò tái lăn xào lăn thơm phức, nhiều hành lá")
                            .image("https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80")
                            .suggestedBy("Phạm Quốc Huy")
                            .build());

                    placeRepository.save(Place.builder()
                            .name("Cộng Cà Phê")
                            .category("cafe")
                            .city("Hà Nội")
                            .priceRange("<100K")
                            .address("116 Cầu Gỗ, Hàng Bạc, Hoàn Kiếm")
                            .recommendedDish("Cà phê cốt dừa thơm béo chuẩn vị Hà Nội")
                            .image("https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80")
                            .suggestedBy("Phạm Quốc Huy")
                            .build());
                }
            } catch (Exception e) {
                System.out.println("DataInitializer: Bỏ qua tạo seed data: " + e.getMessage());
            }
        };
    }
}
