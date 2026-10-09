package com.barberbooking.controller;

import com.barberbooking.dto.WorkingHourRequest;
import com.barberbooking.dto.WorkingHourResponse;
import com.barberbooking.model.WorkingHour;
import com.barberbooking.service.WorkingHourService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shops/{shopId}/working-hours")
public class WorkingHourController {
    private final WorkingHourService workingHourService;
    public WorkingHourController(WorkingHourService workingHourService) {
        this.workingHourService = workingHourService;
    }
    @PostMapping
    public ResponseEntity<WorkingHourResponse> createOrUpdate(
            @PathVariable long shopId,
            @Valid @RequestBody WorkingHourRequest request) {
        WorkingHourResponse response =
                workingHourService.createOrUpdate(
                        shopId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    @GetMapping
    public ResponseEntity<List<WorkingHourResponse>> getWorkingHours(
            @PathVariable long shopId) {
        return ResponseEntity.ok(
                workingHourService.getWorkingHours(shopId)
        );
    }
}
