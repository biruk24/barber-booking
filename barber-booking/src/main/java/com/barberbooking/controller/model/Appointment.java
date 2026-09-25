package com.barberbooking.controller.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "barber_shop_id", nullable = false)
    private BarberShop barberShop;
    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;
    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;
    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
    @Column(name = "adult_count", nullable = false)
    private Integer adultCount = 0;
    @Column(name = "child_count", nullable = false)
    private Integer childCount = 0;
    @Column(nullable = false, length = 30)
    private String status = "PENDING";
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
