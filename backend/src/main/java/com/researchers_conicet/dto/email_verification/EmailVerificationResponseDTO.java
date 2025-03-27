package com.researchers_conicet.dto.email_verification;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EmailVerificationResponseDTO {
    private Long id;
    private String email;
    private LocalDateTime createdAt;
    private boolean registered;
}