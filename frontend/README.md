# FlowFeed Frontend

Static frontend for the FlowFeed social feed app.

## How to run

1. Start the backend from the project root:

```powershell
.\mvnw.cmd spring-boot:run
```

2. In a second terminal, serve this folder:

```powershell
cd frontend
python -m http.server 3000
```

3. Open:

```text
http://localhost:3000
```

## App Flow

- Register or login from the first screen.
- After login, the app opens the home feed.
- Use the composer to publish a post.
- Use Refresh to reload the latest posts.
- Use Logout to return to the login screen.
