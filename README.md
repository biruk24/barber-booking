# 💈 Barber Booking Platform

A full-stack barber shop appointment booking platform built with **Spring Boot and React**. The platform allows barbers to manage their shops, services, schedules, and appointments while customers can discover barber shops and book appointments online.

The goal is to simplify barber shop management and make appointment booking convenient for both barbers and customers.

## 🚀 Features

### 👤 Customer Features
- Browse available barber shops.
- View barber shop profiles and services.
- View service prices and durations.
- Book appointments online.
- Select appointment dates and available time slots.
- Manage and cancel appointments.
- Secure authentication and authorization.

### 💈 Barber Features
- Register and manage a barber account.
- Create and manage a barber shop profile.
- Add, update, and delete services.
- Set service prices and durations.
- Manage shop working hours.
- View customer appointments.
- Manage appointment statuses.
- Share a public booking link with customers.

### 🔐 Security
- JWT-based authentication.
- Spring Security integration.
- Password encryption using BCrypt.
- Role-based access control.
- Shop ownership verification.
- Protection against unauthorized access.
- Secure REST API endpoints.

### ⚙️ Backend Features
- RESTful API architecture.
- Spring Data JPA.
- MySQL database integration.
- Database version control using Flyway.
- Appointment availability management.
- Service and shop validation.
- Centralized exception handling.

## 🛠️ Technologies Used

### Backend
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- MySQL
- Flyway
- Maven
- JWT Authentication

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite
- Axios

### Deployment & Tools
- Git
- GitHub
- Render
- Postman

## 📂 Project Structure

```text
barber-booking/
│
├── barber-booking/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   │           ├── application.properties
│   │           └── db/migration/
│   │
│   └── pom.xml
│
├── barber-booking-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 💻 Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Make sure you have installed:

- Java JDK 17 or later (matching the project's configured Java version).
- Maven.
- Node.js and npm.
- MySQL Server.
- Git.

### 1. Clone the Repository

```bash
git clone https://github.com/biruk24/barber-booking.git
```

Navigate into the project:

```bash
cd barber-booking
```

### 2. Configure the Database

Create a MySQL database:

```sql
CREATE DATABASE barber_shop;
```

Configure your database credentials in:

`barber-booking/src/main/resources/application.properties`

Make sure the database URL, username, and password match your local MySQL configuration.

### 3. Run the Backend

Navigate to the backend directory:

```bash
cd barber-booking
```

Build the application:

```bash
mvn clean install
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend runs on:

```text
http://localhost:9090
```

### 4. Run the Frontend

Open another terminal and navigate to the frontend:

```bash
cd barber-booking-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the frontend in your browser using the URL displayed in the terminal (usually):

```text
http://localhost:5173
```

## 🌐 API

The backend provides RESTful APIs for managing shops, services, authentication, and appointments.

Example public endpoint:

```http
GET /api/shops
```

Example local request:

```text
http://localhost:9090/api/shops
```

The API uses JWT authentication for protected operations.

## ☁️ Deployment

The backend is deployed using **Render**.

Production backend:

```text
https://barber-booking-05fs.onrender.com
```

The deployment uses environment variables for sensitive configuration, including database credentials and JWT secrets.

Never commit passwords, secret keys, or other sensitive configuration to GitHub.

## 🎯 Project Goals

This project aims to:

- Help independent barbers establish an online presence.
- Make appointment booking easier for customers.
- Reduce manual appointment scheduling.
- Give barbers control over their services and working hours.
- Provide a scalable platform for multiple barber shops.
- Make online booking accessible through shareable links.

## 🔮 Future Improvements

- Online payment integration.
- Email and SMS appointment notifications.
- Customer reviews and ratings.
- Advanced appointment analytics.
- Improved mobile responsiveness.
- Automated appointment reminders.
- Admin dashboard for platform management.

## 👨‍💻 Developer

**Biruk**

GitHub: [@biruk24](https://github.com/biruk24)

## 📄 License

This project is currently developed as an independent software project. Licensing terms can be added when the project is officially released.
