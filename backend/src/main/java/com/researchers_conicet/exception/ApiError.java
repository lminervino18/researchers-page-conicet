package com.researchers_conicet.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Standard error response structure.
 * This class defines the format of error responses sent to clients.
 * Used to maintain consistent error reporting across the API.
 */
@Data
@AllArgsConstructor
public class ApiError {
    /**
     * HTTP status code (e.g., 404, 400, 500)
     */
    private int status;

    /**
     * Human-readable error message
     */
    private String message;

    /**
     * When the error occurred
     */
    private LocalDateTime timestamp;
}