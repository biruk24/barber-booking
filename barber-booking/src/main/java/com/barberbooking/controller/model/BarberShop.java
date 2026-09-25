package com.barberbooking.controller.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name="barber_shops")
@Getter
@Setter
@NoArgsConstructor

public class BarberShop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    @Column(nullable = false, length = 150)
    private String name;
    @Column(columnDefinition = "Text")
    private String description;
    @Column(length= 20)
    private String phone;
    @Column(length = 255)
    private String address;
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    @Column(name ="updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
