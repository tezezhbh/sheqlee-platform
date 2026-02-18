# Sheqlee Platform – Backend System

Sheqlee is a scalable freelance marketplace backend designed to connect clients, companies, and freelancers through a secure and structured **RESTful API architecture**.

This repository highlights the backend system architecture, authentication flow, media management, and data modeling strategies implemented during development.

---

## Project Overview
The platform provides:
* **Multi-role authentication** (Admin, Client, Freelancer)
* **Profile management** for companies and users
* **Job structuring** via categories and tags
* **Secure media handling** and centralized error management
* **Scalable MVC architecture**

> The system was built with production-level structure and clean separation of concerns.

---

## 🔐 Authentication & Authorization
* **JWT-based** authentication
* **RBAC** (Role-Based Access Control)
* Protected route middleware
* Secure password hashing with **bcrypt**

---

## Architecture Design
The backend follows a clean **MVC (Model-View-Controller)** pattern:

* `controllers/` - Logic for handling requests
* `models/` - Database schemas
* `routes/` - API endpoints
* `middlewares/` - Auth and validation
* `utils/` & `config/` - Helpers and settings

---

## 🖼 Media Management System
The platform integrates **Cloudinary** for secure cloud storage.
* Profile and Company logo uploads
* Freelancer CV management
* Automatic removal of outdated files
* Conditional upload validation

---

## Technology Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Security:** JWT, bcrypt, crypto
* **File Handling:** Multer, Cloudinary

---

## 👨‍💻 Author
**Halefom Hailu** *Backend Developer (Node.js)*
