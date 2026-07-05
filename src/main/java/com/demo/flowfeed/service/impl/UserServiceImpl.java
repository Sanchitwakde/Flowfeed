package com.demo.flowfeed.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.demo.flowfeed.dto.request.UpdateUserRequest;
import com.demo.flowfeed.dto.response.UserResponse;
import com.demo.flowfeed.entity.User;
import com.demo.flowfeed.exception.BadRequestException;
import com.demo.flowfeed.exception.ResourceNotFoundException;
import com.demo.flowfeed.repository.UserRepository;
import com.demo.flowfeed.service.UserService;
import com.demo.flowfeed.util.CurrentUserUtil;
import com.demo.flowfeed.util.ResponseMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        User user = getAuthenticatedUser();
        return ResponseMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUserProfile(UpdateUserRequest request) {
        User user = getAuthenticatedUser();

        userRepository.findByUsername(request.username())
                .filter(existingUser -> !existingUser.getId().equals(user.getId()))
                .ifPresent(existingUser -> {
                    throw new BadRequestException("Username is already taken");
                });

        user.setUsername(request.username());
        user.setBio(request.bio());

        return ResponseMapper.toUserResponse(userRepository.save(user));
    }

    private User getAuthenticatedUser() {
        String email = CurrentUserUtil.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
