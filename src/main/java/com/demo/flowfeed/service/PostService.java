package com.demo.flowfeed.service;

import java.util.List;

import com.demo.flowfeed.dto.request.CreatePostRequest;
import com.demo.flowfeed.dto.request.UpdatePostRequest;
import com.demo.flowfeed.dto.response.PostResponse;

public interface PostService {

    PostResponse createPost(CreatePostRequest request);

    List<PostResponse> getAllPosts();

    PostResponse getPostById(Long id);

    PostResponse updatePost(Long id, UpdatePostRequest request);

    void deletePost(Long id);
}
