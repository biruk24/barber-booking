package com.barberbooking.controller;

import com.barberbooking.dto.ServiceRequest;
import com.barberbooking.dto.ServiceResponse;
import com.barberbooking.service.ServiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shops/{shopId}/services")
public class ServiceController {
    private final ServiceService serviceService;
    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }
    @PostMapping
    public ResponseEntity<ServiceResponse> createService(
            @PathVariable Long shopId,
            @Valid @RequestBody ServiceRequest request
    ){
        ServiceResponse response =
                serviceService.createService(shopId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getService(
            @PathVariable Long shopId
    ){
        List<ServiceResponse> services =
                serviceService.getServices(shopId);
        return ResponseEntity.ok(services);
    }


}
