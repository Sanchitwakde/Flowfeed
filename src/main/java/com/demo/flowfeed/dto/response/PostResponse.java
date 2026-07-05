package com.demo.flowfeed.dto.response;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        String caption,
        UserResponse user,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
