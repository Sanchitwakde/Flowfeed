package com.demo.flowfeed.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
        @NotBlank(message = "Caption is required")
        @Size(max = 1000, message = "Caption must not exceed 1000 characters")
        String caption
) {
}
