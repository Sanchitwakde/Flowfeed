import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const TOKEN_KEY = "flowfeed.token";

const emptyAuthForm = {
  username: "",
  email: "",
  password: ""
};

const emptyProfileForm = {
  username: "",
  bio: ""
};

function getErrorMessage(payload) {
  if (!payload) {
    return "Something went wrong. Please try again.";
  }

  if (typeof payload === "string") {
    return payload;
  }

  return payload.message || payload.error || "Something went wrong. Please try again.";
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getInitial(username) {
  return (username || "F").charAt(0).toUpperCase();
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState("");
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingCaption, setEditingCaption] = useState("");
  const [authMessage, setAuthMessage] = useState(null);
  const [appMessage, setAppMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isCurrent = true;

    async function restoreSession() {
      try {
        setIsLoading(true);
        const [user, loadedPosts] = await Promise.all([
          apiRequest("/api/users/me", { method: "GET" }, token),
          apiRequest("/api/posts", { method: "GET" }, token)
        ]);

        if (isCurrent) {
          setCurrentUser(user);
          setPosts(loadedPosts || []);
        }
      } catch {
        if (isCurrent) {
          setToken("");
          setCurrentUser(null);
          setAuthMessage({ type: "error", text: "Please login again." });
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isCurrent = false;
    };
  }, [token]);

  useEffect(() => {
    if (!currentUser) {
      setProfileForm(emptyProfileForm);
      return;
    }

    setProfileForm({
      username: currentUser.username || "",
      bio: currentUser.bio || ""
    });
  }, [currentUser]);

  async function apiRequest(path, options = {}, authToken = token) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    const text = await response.text();
    let payload = null;

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      throw new Error(getErrorMessage(payload));
    }

    return payload;
  }

  function handleAuthInput(event) {
    const { name, value } = event.target;
    setAuthForm((form) => ({ ...form, [name]: value }));
  }

  function handleProfileInput(event) {
    const { name, value } = event.target;
    setProfileForm((form) => ({ ...form, [name]: value }));
  }

  function switchAuthMode(mode) {
    setAuthMode(mode);
    setAuthMessage(null);
    setAuthForm(emptyAuthForm);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthMessage(null);
    setIsLoading(true);

    const payload =
      authMode === "login"
        ? { email: authForm.email, password: authForm.password }
        : authForm;

    try {
      const response = await apiRequest(`/api/auth/${authMode}`, {
        method: "POST",
        body: JSON.stringify(payload)
      }, "");

      setCurrentUser(response.user);
      setAuthForm(emptyAuthForm);
      setToken(response.token);
    } catch (error) {
      setAuthMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPosts() {
    const loadedPosts = await apiRequest("/api/posts", { method: "GET" });
    setPosts(loadedPosts || []);
  }

  async function handleRefreshPosts() {
    setAppMessage(null);

    try {
      setIsLoading(true);
      await loadPosts();
    } catch (error) {
      setAppMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreatePost(event) {
    event.preventDefault();
    setAppMessage(null);

    const trimmedCaption = caption.trim();
    if (!trimmedCaption) {
      setAppMessage({ type: "error", text: "Write something before posting." });
      return;
    }

    try {
      setIsLoading(true);
      await apiRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify({ caption: trimmedCaption })
      });
      setCaption("");
      setAppMessage({ type: "success", text: "Your post is live." });
      await loadPosts();
    } catch (error) {
      setAppMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setAppMessage(null);

    const username = profileForm.username.trim();
    const bio = profileForm.bio.trim();

    if (username.length < 3) {
      setAppMessage({ type: "error", text: "Username must be at least 3 characters." });
      return;
    }

    try {
      setIsLoading(true);
      const updatedUser = await apiRequest("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({ username, bio })
      });

      setCurrentUser(updatedUser);
      setIsEditingProfile(false);
      setAppMessage({ type: "success", text: "Profile updated." });
      await loadPosts();
    } catch (error) {
      setAppMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  function startPostEdit(post) {
    setEditingPostId(post.id);
    setEditingCaption(post.caption || "");
    setAppMessage(null);
  }

  function cancelPostEdit() {
    setEditingPostId(null);
    setEditingCaption("");
  }

  async function handleUpdatePost(postId) {
    setAppMessage(null);

    const trimmedCaption = editingCaption.trim();
    if (!trimmedCaption) {
      setAppMessage({ type: "error", text: "Post caption cannot be empty." });
      return;
    }

    try {
      setIsLoading(true);
      await apiRequest(`/api/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify({ caption: trimmedCaption })
      });
      cancelPostEdit();
      setAppMessage({ type: "success", text: "Post updated." });
      await loadPosts();
    } catch (error) {
      setAppMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeletePost(postId) {
    setAppMessage(null);

    if (!window.confirm("Delete this post permanently?")) {
      return;
    }

    try {
      setIsLoading(true);
      await apiRequest(`/api/posts/${postId}`, { method: "DELETE" });
      if (editingPostId === postId) {
        cancelPostEdit();
      }
      setAppMessage({ type: "success", text: "Post deleted." });
      await loadPosts();
    } catch (error) {
      setAppMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    setToken("");
    setCurrentUser(null);
    setPosts([]);
    setCaption("");
    setProfileForm(emptyProfileForm);
    setIsEditingProfile(false);
    cancelPostEdit();
    setAppMessage(null);
    switchAuthMode("login");
  }

  if (!token) {
    return (
      <div className="auth-page">
        <section className="brand-panel">
          <div className="brand-mark">FlowFeed</div>
          <div>
            <h1>Connect with your circle.</h1>
            <p>Share quick thoughts, follow fresh updates, and keep your feed focused on people you care about.</p>
          </div>
        </section>

        <main className="auth-panel">
          <div className="auth-header">
            <div>
              <p className="eyebrow">Welcome</p>
              <h2>{authMode === "login" ? "Sign in to FlowFeed" : "Create your account"}</h2>
            </div>
            <div className="tab-switcher" aria-label="Authentication options">
              <button
                className={`tab-button ${authMode === "login" ? "active" : ""}`}
                type="button"
                onClick={() => switchAuthMode("login")}
              >
                Login
              </button>
              <button
                className={`tab-button ${authMode === "register" ? "active" : ""}`}
                type="button"
                onClick={() => switchAuthMode("register")}
              >
                Register
              </button>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <label>
                <span>Username</span>
                <input
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  autoComplete="username"
                  value={authForm.username}
                  onChange={handleAuthInput}
                  required
                />
              </label>
            )}

            <label>
              <span>Email</span>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={authForm.email}
                onChange={handleAuthInput}
                required
              />
            </label>

            <label>
              <span>Password</span>
              <input
                name="password"
                type="password"
                placeholder={authMode === "login" ? "Enter your password" : "At least 6 characters"}
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
                value={authForm.password}
                onChange={handleAuthInput}
                required
              />
            </label>

            <button type="submit" className="primary-button" disabled={isLoading}>
              {isLoading ? "Please wait..." : authMode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          {authMessage && (
            <div className={`message visible ${authMessage.type}`} aria-live="polite">
              {authMessage.text}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-dot" />
          <strong>FlowFeed</strong>
        </div>
        <button className="ghost-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="home-layout">
        <aside className="profile-panel">
          <div className="profile-card">
            <div className="avatar">{getInitial(currentUser?.username)}</div>
            {!isEditingProfile ? (
              <>
                <h2>{currentUser?.username || "FlowFeed User"}</h2>
                <p>{currentUser?.email || ""}</p>
                <p className="profile-bio">{currentUser?.bio || "No bio yet."}</p>
                <button className="ghost-button full-width" type="button" onClick={() => setIsEditingProfile(true)}>
                  Edit profile
                </button>
              </>
            ) : (
              <form className="profile-form" onSubmit={handleProfileSubmit}>
                <label>
                  <span>Username</span>
                  <input
                    name="username"
                    type="text"
                    minLength="3"
                    maxLength="30"
                    value={profileForm.username}
                    onChange={handleProfileInput}
                    required
                  />
                </label>
                <label>
                  <span>Bio</span>
                  <textarea
                    name="bio"
                    rows="4"
                    maxLength="500"
                    placeholder="Tell people about yourself"
                    value={profileForm.bio}
                    onChange={handleProfileInput}
                  />
                </label>
                <div className="profile-actions">
                  <button type="submit" className="primary-button" disabled={isLoading}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setIsEditingProfile(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </aside>

        <section className="feed-panel">
          <form className="composer" onSubmit={handleCreatePost}>
            <label htmlFor="captionInput">What would you like to share?</label>
            <textarea
              id="captionInput"
              rows="4"
              maxLength="1000"
              placeholder="Write a post..."
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />
            <div className="composer-actions">
              <span>{caption.length}/1000</span>
              <button type="submit" className="primary-button" disabled={isLoading}>
                Post
              </button>
            </div>
          </form>

          <div className="feed-header">
            <div>
              <p className="eyebrow">Timeline</p>
              <h1>Latest posts</h1>
            </div>
            <button className="ghost-button" type="button" onClick={handleRefreshPosts} disabled={isLoading}>
              Refresh
            </button>
          </div>

          {appMessage && (
            <div className={`message visible ${appMessage.type}`} aria-live="polite">
              {appMessage.text}
            </div>
          )}

          <div className="posts-list">
            {posts.length === 0 ? (
              <div className="empty-state">
                {isLoading ? "Loading posts..." : "No posts yet. Be the first to share something."}
              </div>
            ) : (
              posts.map((post) => {
                const isOwner = currentUser?.id && post.user?.id === currentUser.id;
                const isEditingPost = editingPostId === post.id;

                return (
                  <article className="post-card" key={post.id}>
                    <div className="post-topline">
                      <div className="post-author">
                        <div className="post-avatar">{getInitial(post.user?.username)}</div>
                        <div>
                          <strong>{post.user?.username || "Unknown"}</strong>
                          <span>{post.user?.email || ""}</span>
                        </div>
                      </div>
                      <span className="post-time">{formatDate(post.createdAt)}</span>
                    </div>

                    {isEditingPost ? (
                      <div className="post-editor">
                        <textarea
                          rows="4"
                          maxLength="1000"
                          value={editingCaption}
                          onChange={(event) => setEditingCaption(event.target.value)}
                        />
                        <div className="post-actions">
                          <span>{editingCaption.length}/1000</span>
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() => handleUpdatePost(post.id)}
                            disabled={isLoading}
                          >
                            Save
                          </button>
                          <button type="button" className="ghost-button" onClick={cancelPostEdit} disabled={isLoading}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p>{post.caption || ""}</p>
                        {isOwner && (
                          <div className="post-actions">
                            <button type="button" className="ghost-button" onClick={() => startPostEdit(post)}>
                              Edit
                            </button>
                            <button
                              type="button"
                              className="danger-button"
                              onClick={() => handleDeletePost(post.id)}
                              disabled={isLoading}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
