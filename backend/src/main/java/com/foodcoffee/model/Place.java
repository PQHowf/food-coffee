package com.foodcoffee.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "places")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; // "food" or "cafe"

    @Column(nullable = false)
    private String city;

    private String district;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(columnDefinition = "TEXT")
    private String recommendedDish;

    @Column(columnDefinition = "TEXT")
    private String image;

    private String suggestedBy;

    private String suggestedByRole;

    private Double rating;

    private Integer reviewCount;

    private Integer price;

    private String priceDisplay;

    @ElementCollection
    @CollectionTable(name = "place_tags", joinColumns = @JoinColumn(name = "place_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private LocalDate createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDate.now();
        }
        if (this.rating == null) {
            this.rating = 5.0;
        }
        if (this.reviewCount == null) {
            this.reviewCount = 1;
        }
    }
}
