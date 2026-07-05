# Project Information

## Project Name

Flowfeed

## Project Type

Full-stack social feed application with a Spring Boot REST API backend and a static HTML, CSS, and JavaScript frontend.

## Purpose

Flowfeed allows users to register, login, manage their profile, and create or manage feed posts. The backend protects private API routes using JWT-based authentication.

## Main Features

- User registration and login
- JWT token generation and validation
- Protected REST API endpoints
- Current user profile retrieval and update
- Post creation, listing, reading, updating, and deletion
- Request validation using Jakarta Validation
- Centralized exception handling
- MySQL database persistence using Spring Data JPA
- Basic frontend stored in the `frontend` directory

## Backend Package Structure

```text
src/main/java/com/demo/flowfeed
```

Important packages:

| Package | Responsibility |
| --- | --- |
| `controller` | REST API controllers |
| `service` | Business logic contracts |
| `service.impl` | Business logic implementations |
| `repository` | Spring Data JPA repositories |
| `entity` | JPA database entities |
| `dto.request` | Incoming request DTOs |
| `dto.response` | Outgoing response DTOs |
| `security` | JWT filter, JWT service, and Spring Security config |
| `exception` | Custom exceptions and global exception handler |
| `config` | Application-level configuration |
| `util` | Helper classes |

## Main Entities

| Entity | Description |
| --- | --- |
| `User` | Stores user account and profile information |
| `Post` | Stores user-created post content |
| `Role` | Defines user role values |

## Authentication Flow

1. A user registers using `/api/auth/register`.
2. A user logs in using `/api/auth/login`.
3. The backend returns an auth response containing a JWT token and user data.
4. The frontend or API client sends the token in the `Authorization` header.
5. `JwtFilter` validates the token before protected endpoints are accessed.

Authorization header format:

```text
Authorization: Bearer <token>
```

## Configuration

The application uses `src/main/resources/application.properties`.

Current configured values:

| Property | Value |
| --- | --- |
| `spring.application.name` | `flowfeed` |
| `server.port` | `8080` |
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/flowfeed` |
| `spring.datasource.username` | `${DB_USERNAME}` |
| `spring.datasource.password` | `${DB_PASSWORD}` |
| `spring.jpa.hibernate.ddl-auto` | `${JPA_DDL_AUTO:update}` |
| `spring.jackson.time-zone` | `Asia/Kolkata` |

Required runtime environment variables:

| Variable | Purpose |
| --- | --- |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `APP_JWT_SECRET` | JWT signing secret |
| `APP_JWT_EXPIRATION_MS` | JWT expiry time in milliseconds |

## API Summary

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/users/me` | Protected | Get current user profile |
| PUT | `/api/users/me` | Protected | Update current user profile |
| POST | `/api/posts` | Protected | Create post |
| GET | `/api/posts` | Protected | Get all posts |
| GET | `/api/posts/{id}` | Protected | Get one post |
| PUT | `/api/posts/{id}` | Protected | Update post |
| DELETE | `/api/posts/{id}` | Protected | Delete post |

## Build and Run

Run the backend:

```powershell
.\mvnw.cmd spring-boot:run
```

Run tests:

```powershell
.\mvnw.cmd test
```

## Notes

- The backend expects MySQL database `flowfeed` to exist before startup.
- All routes except `/api/auth/register` and `/api/auth/login` require JWT authentication.
- The JWT secret should be kept private and should not be committed to Git.
