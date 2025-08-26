## HealthMate Backend – API Documentation

The backend service for **HealthMate – AI-Powered Medical Diagnosis System**, built using **Spring Boot**. It enables users to securely register, verify their accounts, and receive AI-generated medical diagnosis reports powered by **Gemini AI** (Google).

---

### Authentication API (`/api/auth`)

#### 1. `POST /api/auth/register`

Registers a new user and sends an OTP to their email for verification.

**Request Body** (JSON):

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Responses**:

* `200 OK`: OTP sent to email.
* `400 Bad Request`: Email already registered or invalid input.
* `500 Internal Server Error`: Unexpected error.

---

#### 2. `POST /api/auth/verify-otp`

Verifies the OTP sent to the user's email.

**Request Body** (JSON):

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Responses**:

* `200 OK`: Returns token, user ID and message 'Email  verified succesfully'.
* `400 Bad Request`: Invalid or expired OTP.
* `404 Not Found`: User not found.
* `500 Internal Server Error`: Unexpected error.

---

#### 3. `POST /api/auth/login`

Authenticates a verified user and returns a JWT token.

**Request Body** (JSON):

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Responses**:

* `200 OK`: Returns token and user ID.
* `401 Unauthorized`: Invalid credentials or email not verified.
* `500 Internal Server Error`: Login failed.

---

#### 4. `GET /api/auth/me`

Fetches the currently authenticated user using JWT in the `Authorization` header.

**Response**:

* `200 OK`: User object.
* `404 Not Found`: User not found.

---

#### 5. `DELETE /api/auth`

Deletes the authenticated user account.

**Response**:

* `200 OK`: Account deleted.
* `404 Not Found`: User not found.

---

### Diagnosis API (`/api/diagnosis`)

#### 1. `POST /api/diagnosis`

Submits symptoms and returns an AI-generated diagnosis.

**Request Body** (JSON):

```json
{
  "userId": "abc123",
  "symptoms": "fever, headache, and body pain"
}
```

**Responses**:

* `200 OK`: Returns a `DiagnosisReport` object.
* `400 Bad Request`: Missing fields.
* `500 Internal Server Error`: Error during AI analysis.

---

#### 2. `GET /api/diagnosis/history?userId=abc123`

Fetches all past diagnosis reports for a specific user.

**Response**:

* `200 OK`: List of diagnosis reports.
* `400 Bad Request`: Missing `userId`.

---

#### 3. `GET /api/diagnosis/{reportId}`

Fetches a specific diagnosis report by its ID.

**Response**:

* `200 OK`: Diagnosis report object.
* `404 Not Found`: Report not found.

---

#### 4. `DELETE /api/diagnosis/{reportId}`

Deletes a specific diagnosis report.

**Response**:

* `200 OK`: Report deleted.
* `404 Not Found`: Report not found.

---

## Security

* JWT-based stateless authentication.
* Passwords are securely hashed using `PasswordEncoder`.
* Email verification is enforced before login.

---

## AI Integration

The diagnosis logic is powered by the `GeminiService`, which internally connects to Google’s Gemini API for intelligent response generation based on natural language symptom input.

---

## Tech Stack

* Backend: Java, Spring Boot
* Database: MongoDB
* Security: Spring Security, JWT
* AI Engine: Google Gemini API
* Mail: SMTP-based OTP email via `EmailService`

---

## Setup & Run Locally

```bash
# Clone repository
git clone https://github.com/your-username/healthmate.git
cd server

# 1. Configure environment variables in application.properties
#    - DB config
#    - Mail SMTP config
#    - Gemini API Key
#    - JWT Secret
# Use `application-sample.properties` as a template to create your own `application.properties`.

# 2. Run the app
./mvnw spring-boot:run
#or
mvn spring-boot:run
```

---

## Prerequisites

* Java 17 or higher
* Maven 3+
* MongoDB (running locally or cloud-hosted)

---

## Folder Structure

```
root/
└── server/                  # Spring Boot backend
    ├── src/
    │   └── main/
    │       ├── java/com/healthmate/
    │       │   ├── config/               # Spring Security config
    │       │   ├── controller/           # REST controllers
    │       │   ├── model/                # Entity models
    │       │   ├── repository/           # JPA repositories
    │       │   ├── security/             # JWT token utils and filters
    │       │   └── service/              # Business logic and Gemini AI integration
    │       └── resources/
    │           ├── static/
    │           ├── templates/
    │           ├── application.properties
    │           └── application-sample.properties
    └── pom.xml
```
