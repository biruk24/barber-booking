package com.barberbooking.repository;

import com.barberbooking.controller.model.WorkingHour;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkingHourRepository extends JpaRepository<WorkingHour, Long> {
    List<WorkingHour> findByWorkingDayIsNull();
}
