package com.demo.flowfeed.dto.response;

import java.time.LocalDateTime;

import com.demo.flowfeed.entity.Role;

public record UserResponse(
        Long id,
        String username,
        String email,
        String bio,
        String profilePhotoUrl,
        Role role,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
