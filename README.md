# NestJS REST API Auth Portal

## Description

NestJS REST API boilerplate for typical project

Frontend (React, Next.js): https://github.com/mahmodghnaj/Auth-Portal-client

## Features

- [x] Database ([mongoose](https://www.npmjs.com/package/mongoose)).
- [x] Config Service ([@nestjs/config](https://www.npmjs.com/package/@nestjs/config)).
- [x] Mailing ([nodemailer](https://www.npmjs.com/package/nodemailer)).
- [x] Sign in and sign up via email.
- [x] Social sign in (Facebook,Github).
- [x] Login and handling multiple devices.

## Quick run

```bash
git clone  https://github.com/mahmodghnaj/Auth-Portal-Server my-app
cd my-app/
cp env-example .env
npm install
```

```bash
npm run start:dev
```

## General info

### Auth email flow

By default boilerplate used sign in and sign up email and password.

```mermaid
sequenceDiagram
    participant A as Frontend App (Web, Mobile, Desktop)
    participant B as Backend App

    A->>B: 1. Sign up via email and password
    A->>B: 2. Sign in via email and password
    B->>A: 3. Get a JWT token
    A->>B: 4. Make any requests using a JWT token
```

### Auth via external services or social networks flow

Also you can sign up via another external services or social networks like Google and Github.

```mermaid
    sequenceDiagram
    participant A as Frontend App (Web, Mobile, Desktop)
    participant B as Backend App
    participant S as Social Media Provider

    A->>B: 1. Initiate social media login
    B->>S: 2. Redirect to social media login page
    S-->>B: 3. User logs in on social media
    B->>S: 4. Request user information from social media
    S-->>B: 5. Provide user information
    B->>A: 6. Send user data to frontend
    Note over B, A: Include token, refreshToken, expiresIn

```

## Refresh token flow

```mermaid
sequenceDiagram
    participant A as Frontend App (Web, Mobile, Desktop)
    participant B as Backend App

    A->>B: 1. Send request with JWT token (from cookies) and refresh token in JSON
    B->>B: 2. AuthGuard intercepts the request
    B->>B: 3. JwtRefreshStrategy extracts JWT token from cookies and refresh token from JSON
    B->>B: 4. Validate refresh token
    B-->>B: 5. If refresh token is valid, decode and attach to payload
    B->>A: 6. Send new JWT token in JSON
    B->>A: 7. Set new refresh token in response cookie (HttpOnly)
    Note over B, A: Set 'refreshToken' in response cookie with HttpOnly flag
    A->>B: 8. Receive and process new JWT token



```

## illustrate the process of login and handling multiple devices

```mermaid
sequenceDiagram
    participant A as Frontend
    participant B as Backend

    A->>B: 1. Login request with email and password
    B->>B: 2. Validate user credentials
    B->>B: 3. Generate access token
    B->>B: 4. Generate refresh token
    B->>B: 5. Save refresh token to user profile
    B->>B: 6. Create a new session (Login from Device 1)
    B->>A: 7. Send access and refresh tokens to Device 1

    A->>B: 8. Request with expired access token and valid refresh token
    B->>B: 9. Validate refresh token
    B->>B: 10. Generate a new access token
    B->>A: 11. Send new access token to Device 1

    A->>B: 12. Login request from Device 2
    B->>B: 13. Validate user credentials
    B->>B: 14. Generate access token for Device 2
    B->>B: 15. Generate refresh token for Device 2
    B->>B: 16. Save refresh token to user profile
    B->>B: 17. Create a new session (Login from Device 2)
    B->>A: 18. Send access and refresh tokens to Device 2

```
