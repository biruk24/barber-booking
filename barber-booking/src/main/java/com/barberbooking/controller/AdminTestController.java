package com.barberbooking.controller;

import com.barberbooking.dto.AdminBarberResponse;
import com.barberbooking.dto.AdminShopResponse;
import com.barberbooking.dto.AdminAppointmentResponse;

import com.barberbooking.model.Appointment;
import com.barberbooking.model.BarberShop;
import com.barberbooking.model.User;

import com.barberbooking.repository.AppointmentRepository;
import com.barberbooking.repository.BarberShopRepository;
import com.barberbooking.repository.UserRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminTestController {

    private final UserRepository userRepository;
    private final BarberShopRepository barberShopRepository;
    private final AppointmentRepository appointmentRepository;

    public AdminTestController(
            UserRepository userRepository,
            BarberShopRepository barberShopRepository,
            AppointmentRepository appointmentRepository
    ) {
        this.userRepository = userRepository;
        this.barberShopRepository = barberShopRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @GetMapping("/test")
    public Map<String, String> test() {
        return Map.of("message", "Admin access successful!");
    }

    @GetMapping("/dashboard/stats")
    public Map<String, Long> getDashboardStats() {
        return Map.of(
                "totalBarbers", userRepository.countByRole("BARBER"),
                "totalShops", barberShopRepository.count(),
                "totalAppointments", appointmentRepository.count()
        );
    }

    @GetMapping("/barbers")
    public List<AdminBarberResponse> getAllBarbers() {

        List<User> barbers = userRepository.findAllByRole("BARBER");

        return barbers.stream()
                .map(barber -> {

                    BarberShop shop = barberShopRepository
                            .findByUserId(barber.getId())
                            .orElse(null);

                    return new AdminBarberResponse(
                            barber.getId(),
                            barber.getName(),
                            barber.getEmail(),
                            barber.getPhone(),
                            shop != null ? shop.getName() : null,
                            shop != null ? shop.getSlug() : null
                    );
                })
                .toList();
    }

    @GetMapping("/shops")
    public List<AdminShopResponse> getAllShops() {

        return barberShopRepository.findAll()
                .stream()
                .map(shop -> {

                    User barber = shop.getUser();

                    return new AdminShopResponse(
                            shop.getId(),
                            shop.getName(),
                            shop.getSlug(),
                            shop.getDescription(),
                            shop.getPhone(),
                            shop.getAddress(),
                            barber.getId(),
                            barber.getName(),
                            barber.getEmail()
                    );
                })
                .toList();
    }

    @GetMapping("/appointments")
    public List<AdminAppointmentResponse> getAllAppointments() {

        List<Appointment> appointments = appointmentRepository.findAll();

        return appointments.stream()
                .map(appointment -> {

                    BarberShop shop = appointment.getBarberShop();

                    return new AdminAppointmentResponse(
                            appointment.getId(),
                            shop.getId(),
                            shop.getName(),
                            appointment.getCustomerName(),
                            appointment.getCustomerPhone(),
                            appointment.getAppointmentDate(),
                            appointment.getStartTime(),
                            appointment.getEndTime(),
                            appointment.getAdultCount(),
                            appointment.getChildCount(),
                            appointment.getStatus(),
                            appointment.getTotalPrice()
                    );
                })
                .toList();
    }
}