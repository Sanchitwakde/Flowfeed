const API_BASE_URL = "http://localhost:8080";

const storageKeys = {
    token: "flowfeed.token"
};

const state = {
    token: localStorage.getItem(storageKeys.token) || "",
    currentUser: null
};

const elements = {
    authPage: document.getElementById("authPage"),
    homePage: document.getElementById("homePage"),
    authTitle: document.getElementById("authTitle"),
    authMessage: document.getElementById("authMessage"),
    appMessage: document.getElementById("appMessage"),
    loginForm: document.getElementById("loginForm"),
    registerForm: document.getElementById("registerForm"),
    postForm: document.getElementById("postForm"),
    captionInput: document.getElementById("captionInput"),
    characterCount: document.getElementById("characterCount"),
    logoutButton: document.getElementById("logoutButton"),
    refreshPostsButton: document.getElementById("refreshPostsButton"),
    postsContainer: document.getElementById("postsContainer"),
    profileAvatar: document.getElementById("profileAvatar"),
    profileUsername: document.getElementById("profileUsername"),
    profileEmail: document.getElementById("profileEmail"),
    profileBio: document.getElementById("profileBio"),
    tabButtons: document.querySelectorAll(".tab-button")
};

function showView(viewName) {
    const isHome = viewName === "home";
    elements.authPage.classList.toggle("hidden", isHome);
    elements.homePage.classList.toggle("hidden", !isHome);
}

function showMessage(target, message, type = "success") {
    target.textContent = message;
    target.className = `message visible ${type}`;
}

function clearMessage(target) {
    target.textContent = "";
    target.className = "message";
}

function saveToken(token) {
    state.token = token || "";
    if (state.token) {
        localStorage.setItem(storageKeys.token, state.token);
    } else {
        localStorage.removeItem(storageKeys.token);
    }
}

function setActiveTab(tabName) {
    elements.tabButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === tabName);
    });

    const isLogin = tabName === "login";
    elements.authTitle.textContent = isLogin ? "Sign in to FlowFeed" : "Create your account";
    elements.loginForm.classList.toggle("hidden", !isLogin);
    elements.registerForm.classList.toggle("hidden", isLogin);
    clearMessage(elements.authMessage);
}

async function apiRequest(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (state.token) {
        headers.Authorization = `Bearer ${state.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    let payload = null;
    const text = await response.text();
    if (text) {
        try {
            payload = JSON.parse(text);
        } catch {
            payload = text;
        }
    }

    if (!response.ok) {
        const message =
            payload?.message ||
            payload?.error ||
            (typeof payload === "string" ? payload : "Something went wrong. Please try again.");
        throw new Error(message);
    }

    return payload;
}

function renderProfile(user) {
    state.currentUser = user;
    const username = user?.username || "FlowFeed User";

    elements.profileAvatar.textContent = username.charAt(0).toUpperCase();
    elements.profileUsername.textContent = username;
    elements.profileEmail.textContent = user?.email || "";
    elements.profileBio.textContent = user?.bio || "No bio yet.";
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

function renderPosts(posts) {
    if (!posts || posts.length === 0) {
        elements.postsContainer.innerHTML = '<div class="empty-state">No posts yet. Be the first to share something.</div>';
        return;
    }

    elements.postsContainer.innerHTML = posts
        .map((post) => {
            const username = post.user?.username || "Unknown";
            return `
                <article class="post-card">
                    <div class="post-topline">
                        <div class="post-author">
                            <div class="post-avatar">${escapeHtml(username.charAt(0).toUpperCase())}</div>
                            <div>
                                <strong>${escapeHtml(username)}</strong>
                                <span>${escapeHtml(post.user?.email || "")}</span>
                            </div>
                        </div>
                        <span class="post-time">${escapeHtml(formatDate(post.createdAt))}</span>
                    </div>
                    <p>${escapeHtml(post.caption || "")}</p>
                </article>
            `;
        })
        .join("");
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

async function loadProfile() {
    const user = await apiRequest("/api/users/me", { method: "GET" });
    renderProfile(user);
}

async function loadPosts() {
    const posts = await apiRequest("/api/posts", { method: "GET" });
    renderPosts(posts);
}

async function enterHome() {
    showView("home");
    clearMessage(elements.appMessage);
    await loadProfile();
    await loadPosts();
}

async function handleAuthSubmit(event, mode) {
    event.preventDefault();
    clearMessage(elements.authMessage);

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const response = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify(payload)
    });

    saveToken(response.token);
    form.reset();
    renderProfile(response.user);
    await enterHome();
}

async function handleCreatePost(event) {
    event.preventDefault();
    clearMessage(elements.appMessage);

    const caption = elements.captionInput.value.trim();
    if (!caption) {
        showMessage(elements.appMessage, "Write something before posting.", "error");
        return;
    }

    await apiRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify({ caption })
    });

    elements.postForm.reset();
    updateCharacterCount();
    showMessage(elements.appMessage, "Your post is live.");
    await loadPosts();
}

function handleLogout() {
    saveToken("");
    state.currentUser = null;
    elements.postsContainer.innerHTML = "";
    clearMessage(elements.appMessage);
    setActiveTab("login");
    showView("auth");
}

function updateCharacterCount() {
    elements.characterCount.textContent = `${elements.captionInput.value.length}/1000`;
}

async function initialize() {
    setActiveTab("login");
    updateCharacterCount();

    if (!state.token) {
        showView("auth");
        return;
    }

    try {
        await enterHome();
    } catch (error) {
        saveToken("");
        showView("auth");
        showMessage(elements.authMessage, "Please login again.", "error");
    }
}

elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

elements.loginForm.addEventListener("submit", async (event) => {
    try {
        await handleAuthSubmit(event, "login");
    } catch (error) {
        showMessage(elements.authMessage, error.message, "error");
    }
});

elements.registerForm.addEventListener("submit", async (event) => {
    try {
        await handleAuthSubmit(event, "register");
    } catch (error) {
        showMessage(elements.authMessage, error.message, "error");
    }
});

elements.postForm.addEventListener("submit", async (event) => {
    try {
        await handleCreatePost(event);
    } catch (error) {
        showMessage(elements.appMessage, error.message, "error");
    }
});

elements.captionInput.addEventListener("input", updateCharacterCount);
elements.logoutButton.addEventListener("click", handleLogout);

elements.refreshPostsButton.addEventListener("click", async () => {
    clearMessage(elements.appMessage);
    try {
        await loadPosts();
    } catch (error) {
        showMessage(elements.appMessage, error.message, "error");
    }
});

initialize();
