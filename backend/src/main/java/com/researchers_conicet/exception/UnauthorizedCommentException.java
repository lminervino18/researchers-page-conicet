package com.researchers_conicet.exception;

public class UnauthorizedCommentException extends RuntimeException {
    public UnauthorizedCommentException(String message) {
        super(message);
    }
}