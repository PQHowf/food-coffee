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
            } catch (Exception e) {
                System.out.println("DataInitializer: Bỏ qua tạo seed user: " + e.getMessage());
            }
        };
    }
}
