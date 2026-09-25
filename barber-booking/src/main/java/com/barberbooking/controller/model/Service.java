package com.barberbooking.controller.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "barber_shop_id", nullable = false)
    private BarberShop barberShop;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(columnDefinition = "Text")
    private String description;
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;
    @Column(name = "adult_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    @Column(name = "child_price", precision = 10, scale = 2)
    private BigDecimal childPrice;
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
