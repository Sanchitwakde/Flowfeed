package com.demo.flowfeed.service;

import com.demo.flowfeed.dto.request.LoginRequest;
import com.demo.flowfeed.dto.request.RegisterRequest;
import com.demo.flowfeed.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
