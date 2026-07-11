# Project Structure (03_PROJECT_STRUCTURE.md)

This document provides a comprehensive view of the directory layout and files inside the **Spoken English** attendance portal codebase.

---

## 📂 Directory Tree Layout

```text
Attendance_App_Project/
├── netlify/
│   └── functions/
│       ├── get_data.js
│       ├── save_student.js
│       ├── delete_student.js
│       └── save_attendance.js
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── 03_PROJECT_STRUCTURE.md
├── 04_ARCHITECTURE.md
├── 05_KNOWLEDGE.md
├── 06_DECISIONS.md
├── 07_MODIFICATIONS.md
├── 08_TEST_CASES.md
├── schema.sql
├── netlify.toml
├── .gitignore
├── .env (Local-only, git-ignored)
├── package.json
└── package-lock.json
```

---

## 📝 File Roles & Descriptions

### 1. Frontend Client Layer (`public/`)
* **[index.html](file:///c:/Users/hk/Desktop/Attendance_App_Project/public/index.html):** The primary SPA entry point. Declares all section wrappers, login modals, dashboard KPIs, forms, and table components.
* **[css/style.css](file:///c:/Users/hk/Desktop/Attendance_App_Project/public/css/style.css):** Contains style rules, custom variables (colors, glow depths), floating logo keyframes, and media breakpoints (including bottom tab menu transformation for screen viewports <= 768px).
* **[js/app.js](file:///c:/Users/hk/Desktop/Attendance_App_Project/public/js/app.js):** Coordinates client-side actions, view-switches, form parsing, local cache storage (`localStorage` fallback), and asynchronous HTTP REST API triggers to the serverless function endpoints.

### 2. Serverless Backend Functions (`netlify/`)
* **[functions/get_data.js](file:///c:/Users/hk/Desktop/Attendance_App_Project/netlify/functions/get_data.js):** REST API handler that fetches students list and attendance records history from NeonDB using SQL queries.
* **[functions/save_student.js](file:///c:/Users/hk/Desktop/Attendance_App_Project/netlify/functions/save_student.js):** Handles student registry, checking for duplicate roll number uniqueness.
* **[functions/delete_student.js](file:///c:/Users/hk/Desktop/Attendance_App_Project/netlify/functions/delete_student.js):** Deletes a student profile from PostgreSQL using their unique roll number.
* **[functions/save_attendance.js](file:///c:/Users/hk/Desktop/Attendance_App_Project/netlify/functions/save_attendance.js):** Implements single-query `UPSERT` statements to save or overwrite daily attendance sheets.

### 3. Database Configuration (`schema.sql` & `.env`)
* **[schema.sql](file:///c:/Users/hk/Desktop/Attendance_App_Project/schema.sql):** Database DDL queries specifying table constraints and schema layouts.
* **[.env](file:///c:/Users/hk/Desktop/Attendance_App_Project/.env):** Local environment variables file holding connection strings. Ignored by Git for protection.

### 4. Technical Documentation Logs
* **[04_ARCHITECTURE.md](file:///c:/Users/hk/Desktop/Attendance_App_Project/04_ARCHITECTURE.md):** Architectural design layouts, ASCII data flows, and code call-stack trackers.
* **[05_KNOWLEDGE.md](file:///c:/Users/hk/Desktop/Attendance_App_Project/05_KNOWLEDGE.md):** Document capturing lessons learned (Pg poolers, SQL upserts, CSS navigation overrides, runtime module paths).
* **[06_DECISIONS.md](file:///c:/Users/hk/Desktop/Attendance_App_Project/06_DECISIONS.md):** Justification logs for tech stacks, color systems, and local/remote state patterns.
* **[07_MODIFICATIONS.md](file:///c:/Users/hk/Desktop/Attendance_App_Project/07_MODIFICATIONS.md):** Chronological log of code enhancements, mobile upgrades, and button adjustments.
* **[08_TEST_CASES.md](file:///c:/Users/hk/Desktop/Attendance_App_Project/08_TEST_CASES.md):** Manual and automated QA verification checklist instructions.
