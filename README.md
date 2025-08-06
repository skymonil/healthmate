# HealthMate – AI Medical Diagnosis System

HealthMate is a full-stack application that allows users to enter symptoms and receive AI-generated medical diagnoses. It features secure user authentication, stores diagnosis history, and sends reports via email.

### Tech Stack
- **Frontend**: React.ts, TailwindCSS
- **Backend**: Java Spring Boot (JWT Auth, Email)
- **Database**: MongoDB
- **AI**: Gemini Gen AI (for diagnosis)

### Structure
- `/client` – React frontend
- `/server` – Spring Boot backend

Each folder has its own README with setup instructions.

### Getting Started
```bash
# Frontend
cd client
npm install
npm run dev

# Backend
cd ../server
./mvnw spring-boot:run
```