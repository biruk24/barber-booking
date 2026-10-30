
        package com.barberbooking.exception;

import jakarta.validation.ConstraintViolationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;
import java.time.format.DateTimeParseException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);


    // 1. BAD REQUEST: HTTP 400

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(
            IllegalArgumentException exception
    ) {
        return ResponseEntity.badRequest().body(
                Map.of("message", safeMessage(exception))
        );
    }


    // 2. CONFLICT: HTTP 409

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleConflict(
            IllegalStateException exception
    ) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message", safeMessage(exception))
        );
    }


    // 3. DTO VALIDATION ERRORS: HTTP 400

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException exception
    ) {
        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .filter(error -> error != null && !error.isBlank())
                .findFirst()
                .orElse("Invalid request");

        return ResponseEntity.badRequest().body(
                Map.of("message", message)
        );
    }

    // 4. CONSTRAINT VALIDATION ERRORS: HTTP 400

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraintViolation(
            ConstraintViolationException exception
    ) {
        String message = exception.getConstraintViolations()
                .stream()
                .map(violation -> violation.getMessage())
                .findFirst()
                .orElse("Invalid request");

        return ResponseEntity.badRequest().body(
                Map.of("message", message)
        );
    }

    // 5. INVALID LOGIN CREDENTIALS: HTTP 401

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(
            BadCredentialsException exception
    ) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("message", "Invalid email or password")
        );
    }

    // 6. ACCESS DENIED: HTTP 403


    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(
            AccessDeniedException exception
    ) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of("message", safeMessage(exception))
        );
    }

    // 7. DATABASE CONSTRAINT VIOLATIONS: HTTP 409

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(
            DataIntegrityViolationException exception
    ) {
        logger.warn(
                "Database integrity constraint violation",
                exception
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of(
                        "message",
                        "The request conflicts with existing data. "
                                + "Check the submitted information and try again."
                )
        );
    }

    // 8. UNEXPECTED ERRORS: HTTP 500

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleUnexpectedException(
            Exception exception
    ) {
        System.err.println("\n========== UNEXPECTED SERVER ERROR ==========");
        exception.printStackTrace(System.err);
        System.err.println("========== END OF SERVER ERROR ==============\n");

        logger.error("An unexpected server error occurred", exception);

        return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
        ).body(
                Map.of(
                        "message",
                        "An unexpected server error occurred. Please check the server console."
                )
        );
    }


    // 9. SAFE ERROR MESSAGE

    private String safeMessage(Exception exception) {
        String message = exception.getMessage();

        if (message == null || message.isBlank()) {
            return "The request could not be processed";
        }

        return message;
    }
// HANDLE MALFORMED REQUEST BODIES: HTTP 400


    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleMalformedRequest(
            HttpMessageNotReadableException exception
    ) {
        Throwable cause = exception.getMostSpecificCause();

        String message = "Invalid request data. Check the date, time, and JSON format.";

        if (cause instanceof DateTimeParseException) {
            message = "Invalid date or time format. Use YYYY-MM-DD for dates and HH:mm for times.";
        }

        return ResponseEntity.badRequest().body(
                Map.of("message", message)
        );
    }
}
