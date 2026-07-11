# Database Schema Guide (09_DATABASE_SCHEMA.md)

This document provides a technical specification of the PostgreSQL database schema used by the **Spoken English** platform. 

---

## 📊 Entity Relationship Summary

The database uses a denormalized schema structure for speed and performance, saving complex transactional calculations inside a structured JSONB representation.

```text
  +--------------------------------+       +------------------------------------+
  |            students            |       |          attendance_logs           |
  +--------------------------------+       +------------------------------------+
  | id (PK)         : SERIAL       |       | id (PK)          : SERIAL          |
  | roll_number (U) : VARCHAR(50)  |       | session_date     : DATE            |
  | name            : VARCHAR(255) |       | class_level      : VARCHAR(50)     |
  | class_level     : VARCHAR(50)  |       | records (JSONB)  : {roll: status}  |
  +--------------------------------+       | stats (JSONB)    : {present, ...}  |
                                           +------------------------------------+
                                           | UNIQUE(session_date, class_level)  |
                                           +------------------------------------+
```

---

## 🛠️ Table Schemas

### 1. `students` Table
Stores student enrollment profiles. Each student is identified by a unique academic roll number.

| Column Name | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing identifier. |
| `roll_number` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Unique registration number (e.g., `SE202601`). |
| `name` | `VARCHAR(255)` | `NOT NULL` | Student's full name. |
| `class_level` | `VARCHAR(50)` | `NOT NULL` | Class group designation (`Level 1` to `Level 4`). |

**SQL Definition:**
```sql
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    class_level VARCHAR(50) NOT NULL
);
```

---

### 2. `attendance_logs` Table
Stores daily class attendance sheets. Uses a unique composite constraint on the combination of `session_date` and `class_level` to prevent duplicate logs for a class on the same day.

| Column Name | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing transaction ID. |
| `session_date` | `DATE` | `NOT NULL` | Date of the class session (YYYY-MM-DD). |
| `class_level` | `VARCHAR(50)` | `NOT NULL` | Class level targeted (`Level 1` to `Level 4`). |
| `records` | `JSONB` | `NOT NULL` | Key-value mapping of student roll numbers to status. |
| `stats` | `JSONB` | `NOT NULL` | Attendance metrics (attendance rate, totals). |

**Composite Unique Constraint:**
- `UNIQUE(session_date, class_level)`

**SQL Definition:**
```sql
CREATE TABLE IF NOT EXISTS attendance_logs (
    id SERIAL PRIMARY KEY,
    session_date DATE NOT NULL,
    class_level VARCHAR(50) NOT NULL,
    records JSONB NOT NULL,
    stats JSONB NOT NULL,
    UNIQUE(session_date, class_level)
);
```

---

## 📦 JSONB Schema Payload Structures

### A. The `records` JSONB Payload
This column stores a dictionary mapping of student roll numbers to their attendance status (`present`, `absent`, or `late`).

**Example JSON representation:**
```json
{
  "SE202601": "present",
  "SE202602": "absent",
  "SE202603": "late"
}
```

---

### B. The `stats` JSONB Payload
This column saves calculated statistical counters and percentages compiled by the client when saving the log.

**Example JSON representation:**
```json
{
  "present": 12,
  "absent": 2,
  "late": 1,
  "total": 15,
  "rate": 80
}
```

* **Formula:** `rate = ((present + late) / total) * 100` (rounded to nearest integer).
