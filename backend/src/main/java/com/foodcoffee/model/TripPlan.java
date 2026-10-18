package com.foodcoffee.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trip_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripPlan {

    @Id
    @Column(nullable = false, length = 100)
    private String id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", length = 100)
    private String username;

    @Column(nullable = false)
    private String title;

    private String tripType;

    private Integer totalDays;

    private String startDate;

    private String endDate;

    private String status;

    private Long createdAt;

    @Column(columnDefinition = "TEXT")
    private String itemsJson;
}
