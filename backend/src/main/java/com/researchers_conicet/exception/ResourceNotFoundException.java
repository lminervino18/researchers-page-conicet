package com.researchers_conicet.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception for handling "resource not found" scenarios.
 * This exception is thrown when a requested resource (e.g., a research paper) is not found in the database.
 * The @ResponseStatus annotation automatically maps this exception to HTTP 404 (NOT_FOUND).
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    
    /**
     * Constructor with error message
     * @param message Description of what resource was not found
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructor with error message and cause
     * @param message Description of what resource was not found
     * @param cause The original exception that caused this one
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}