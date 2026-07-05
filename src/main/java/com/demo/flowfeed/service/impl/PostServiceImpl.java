package com.demo.flowfeed.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.demo.flowfeed.dto.request.CreatePostRequest;
import com.demo.flowfeed.dto.request.UpdatePostRequest;
import com.demo.flowfeed.dto.response.PostResponse;
import com.demo.flowfeed.entity.Post;
import com.demo.flowfeed.entity.User;
import com.demo.flowfeed.exception.ResourceNotFoundException;
import com.demo.flowfeed.exception.UnauthorizedException;
import com.demo.flowfeed.repository.PostRepository;
import com.demo.flowfeed.repository.UserRepository;
import com.demo.flowfeed.service.PostService;
import com.demo.flowfeed.util.CurrentUserUtil;
import com.demo.flowfeed.util.ResponseMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public PostResponse createPost(CreatePostRequest request) {
        User user = getAuthenticatedUser();

        Post post = Post.builder()
                .caption(request.caption())
                .user(user)
                .build();

        return ResponseMapper.toPostResponse(postRepository.save(post));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ResponseMapper::toPostResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id) {
        return ResponseMapper.toPostResponse(findPostById(id));
    }

    @Override
    @Transactional
    public PostResponse updatePost(Long id, UpdatePostRequest request) {
        User user = getAuthenticatedUser();
        Post post = findPostById(id);
        validateOwner(post, user);

        post.setCaption(request.caption());
        return ResponseMapper.toPostResponse(postRepository.save(post));
    }

    @Override
    @Transactional
    public void deletePost(Long id) {
        User user = getAuthenticatedUser();
        Post post = findPostById(id);
        validateOwner(post, user);

        postRepository.delete(post);
    }

    private Post findPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
    }

    private User getAuthenticatedUser() {
        String email = CurrentUserUtil.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private void validateOwner(Post post, User user) {
        if (!post.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only modify your own posts");
        }
    }
}
