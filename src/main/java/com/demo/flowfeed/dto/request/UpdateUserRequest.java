package com.demo.flowfeed.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
        String username,

        @Size(max = 500, message = "Bio must not exceed 500 characters")
        String bio,

        @Size(max = 500, message = "Profile photo URL must not exceed 500 characters")
        String profilePhotoUrl
) {
}
