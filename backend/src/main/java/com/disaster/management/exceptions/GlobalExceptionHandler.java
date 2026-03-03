package com.disaster.management.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<Object> handleBadCredentials(
            org.springframework.security.authentication.BadCredentialsException ex) {
        System.err.println("Backend Error: Bad Credentials");
        ex.printStackTrace();
        Map<String, Object> body = new HashMap<>();
        body.put("message", "Invalid username or password");
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<Object> handleAuthenticationException(
            org.springframework.security.core.AuthenticationException ex) {
        System.err.println("Backend Error: Authentication Exception - " + ex.getMessage());
        ex.printStackTrace();
        Map<String, Object> body = new HashMap<>();
        body.put("message", "Authentication failed: " + ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntimeException(RuntimeException ex) {
        System.err.println("Backend Error: Runtime Exception - " + ex.getMessage());
        ex.printStackTrace();
        Map<String, Object> body = new HashMap<>();
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneralException(Exception ex) {
        System.err.println("Backend Error: Unexpected Exception - " + ex.getMessage());
        ex.printStackTrace();
        Map<String, Object> body = new HashMap<>();
        body.put("message", "An unexpected error occurred: " + ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
