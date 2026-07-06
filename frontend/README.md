# FlowFeed React Frontend

React frontend for the FlowFeed social feed app, built with Vite.

## How to run

1. Start the backend from the project root:

```powershell
.\mvnw.cmd spring-boot:run
```

2. Install frontend dependencies:

```powershell
cd frontend
npm install
```

3. Start the React dev server:

```powershell
npm run dev
```

4. Open:

```text
http://localhost:5173
```

To point the frontend at a different backend URL, set `VITE_API_BASE_URL`.

## App Flow

- Register or login from the first screen.
- After login, the app opens the home feed.
- Use the composer to publish a post.
- Use Refresh to reload the latest posts.
- Use Logout to return to the login screen.
