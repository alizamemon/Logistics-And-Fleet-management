package com.example.Logistics.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public Object handleNoResourceFoundException(org.springframework.web.servlet.resource.NoResourceFoundException ex) throws Exception {
        throw ex;
    }

    // runtime exception handler
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> errorDetails = new HashMap<>();

        errorDetails.put("status", HttpStatus.BAD_REQUEST.value()); // 400
        errorDetails.put("error", "Bad Request");
        errorDetails.put("message", ex.getMessage()); // error msgs in services
        errorDetails.put("timestamp", java.time.LocalDateTime.now());

        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    // Generic Error Handler
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> errorDetails = new HashMap<>();

        errorDetails.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value()); // 500
        errorDetails.put("error", "Internal Server Error");
        errorDetails.put("message", "Something went wrong: " + ex.getMessage());
        errorDetails.put("timestamp", java.time.LocalDateTime.now());

        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}