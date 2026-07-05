package com.demo.flowfeed.dto.response;

public record AuthResponse(
    String token,
    String tokenType,
    UserResponse user
    ){
}
