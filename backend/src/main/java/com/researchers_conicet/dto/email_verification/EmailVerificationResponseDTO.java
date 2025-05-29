package com.researchers_conicet.dto.email_verification;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EmailVerificationResponseDTO {
    private String email;
    private String username = null;
    private LocalDateTime createdAt;
    private boolean registered;
}