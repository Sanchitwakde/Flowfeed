package com.demo.flowfeed.util;

import com.demo.flowfeed.dto.response.PostResponse;
import com.demo.flowfeed.dto.response.UserResponse;
import com.demo.flowfeed.entity.Post;
import com.demo.flowfeed.entity.User;

public final class ResponseMapper {

    private ResponseMapper() {
    }

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getProfilePhotoUrl(),
                user.getRole(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public static PostResponse toPostResponse(Post post) {
        return new PostResponse(
                post.getId(),
                post.getCaption(),
                toUserResponse(post.getUser()),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
