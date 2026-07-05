package com.demo.flowfeed.service;

import com.demo.flowfeed.dto.request.LoginRequest;
import com.demo.flowfeed.dto.request.RegisterRequest;
import com.demo.flowfeed.dto.response.AuthResponse;

public class AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
