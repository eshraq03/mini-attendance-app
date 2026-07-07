# Spoken English - Attendance & Roster Management Portal

A premium, interactive, and responsive attendance and student management portal designed for the **Spoken English** academy platform. This system enables instructors to efficiently register students, track attendance across multiple levels, and sync records to a serverless cloud database.

---

## 🌟 Key Features

### 🎨 Midnight Neon Glassmorphism UI
* Eye-friendly dark mode interface tailored for long-duration classroom use.
* Sleek neon glowing borders (`#00e5ff`) and cards with custom frosted-glass effects.
* 3D rotating mask logo overlay with smooth keyframe animations.
* Responsive layouts fitting desktop, tablet, and mobile screens.

### 📊 Attendance Tracking & Roster Management
* Structured grouping of students across four class levels (Level 1 to Level 4).
* One-click bulk status selectors ("Mark All Present" / "Mark All Absent") for speedy classroom operations.
* Real-time calculation of present/absent counts and overall attendance rates.

### 💾 Serverless PostgreSQL Connectivity (NeonDB)
* Live database synchronization with **NeonDB (PostgreSQL)** via stateless **Netlify Functions** (`netlify/functions/`).
* Uses Neon's **Connection Pooling (PgPooler)** endpoint to manage connection limits efficiently.
* Environment variables safely managed inside local `.env` and Netlify dashboards, guaranteeing zero hardcoded database secrets in public files.

### 📡 Hybrid Offline-First Sync
* Active local storage fallback (`LocalStorage`). If the classroom internet connection drops, instructors can record attendance uninterrupted. The client caches all updates locally and pushes them to NeonDB once the connection is restored.

---

## 📂 Project Structure Overview
* `public/`: Static frontend assets served to the client browser:
  * `index.html`: The main single-page application (SPA) layout.
  * `css/style.css`: Custom CSS containing all color systems, responsive layouts, glass card stylings, and animations.
  * `js/app.js`: Main frontend logic, tab navigation, local storage caching, and backend API routing.
* `netlify/functions/`: Serverless backend endpoints:
  * `get_data.js`: Retrieves all active students and past logs from PostgreSQL.
  * `save_student.js`: Adds new student profiles, checking for roll number unique violations.
  * `delete_student.js`: Deletes a student from the database using their unique roll number.
  * `save_attendance.js`: Performs an atomic `UPSERT` to store or update daily attendance sheets.
* `schema.sql`: DDL initialization script for the database tables.
* `04_ARCHITECTURE.md`: Technical documentation of the architecture and data flows.
* `05_KNOWLEDGE.md`: Document details project justifications and design decisions.
* `11_TROUBLESHOOTING.md`: Detailed logs of bugs encountered and their architectural resolutions.
