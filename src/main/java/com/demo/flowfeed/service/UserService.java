package com.demo.flowfeed.service;

import com.demo.flowfeed.dto.request.UpdateUserRequest;
import com.demo.flowfeed.dto.response.UserResponse;

public interface UserService {

    UserResponse getCurrentUserProfile();

    UserResponse updateCurrentUserProfile(UpdateUserRequest request);
}
