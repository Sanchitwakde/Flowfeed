# Flowfeed

Flowfeed is a Spring Boot social feed API with JWT authentication, user profiles, and post management. The repository also includes a simple frontend in the `frontend` folder.

## Tech Stack

- Java 17
- Spring Boot 4.1.0
- Spring Web MVC
- Spring Security with JWT
- Spring Data JPA
- MySQL
- Maven
- HTML, CSS, and JavaScript frontend

## Requirements

- Java 17 or later
- MySQL running locally
- Maven, or use the included Maven wrapper

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE flowfeed;
```

The app reads database credentials from environment variables:

```powershell
$env:DB_USERNAME="your_mysql_username"
$env:DB_PASSWORD="your_mysql_password"
```

JWT configuration is also required because `JwtService` reads these properties:

```powershell
$env:APP_JWT_SECRET="your-very-long-secret-key-at-least-32-characters"
$env:APP_JWT_EXPIRATION_MS="86400000"
```

Optional JPA setting:

```powershell
$env:JPA_DDL_AUTO="update"
```

## Run Backend

From the project root:

```powershell
.\mvnw.cmd spring-boot:run
```

The API runs on:

```text
http://localhost:8080
```

## API Endpoints

Public auth endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT |

Protected user endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update current user profile |

Protected post endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/posts` | Create a post |
| GET | `/api/posts` | Get all posts |
| GET | `/api/posts/{id}` | Get post by ID |
| PUT | `/api/posts/{id}` | Update post by ID |
| DELETE | `/api/posts/{id}` | Delete post by ID |

For protected routes, send the JWT in the request header:

```text
Authorization: Bearer <token>
```

## Example Requests

Register:

```json
{
  "username": "sanchit",
  "email": "sanchit@example.com",
  "password": "password123"
}
```

Create post:

```json
{
  "caption": "My first Flowfeed post"
}
```

## Run Tests

```powershell
.\mvnw.cmd test
```

## Frontend

Frontend files are available in:

```text
frontend/
```

Open `frontend/index.html` in a browser or serve the folder with a local static server.
