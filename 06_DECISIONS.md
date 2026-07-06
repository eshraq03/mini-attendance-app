# Architectural Decision Records (ADRs)

This document records the critical architectural decisions made during the design phase of the Attendance Tracking Application.

## 001: Choice of Tech Stack (Serverless + Managed Postgres)

### Context & Problem Statement
The application requires a database to store student data and daily attendance logs with relational integrity. It also needs a secure backend layer to communicate with the database without exposing credentials to the frontend. The project must have minimal operational overhead, require zero server maintenance, and scale easily.

### Decision Rationale
We selected **NeonDB (PostgreSQL)** for the data layer and **Netlify Functions** for the serverless backend API layer. 

#### 🚀 NeonDB (Managed PostgreSQL)
* **Pros:**
    * **Fully Managed:** No database provisioning, maintenance, or scaling configs required.
    * **Serverless Features:** Supports auto-suspend (scales to zero when not in use), saving computing costs during inactive hours.
    * **Relational Integrity:** Pure PostgreSQL engine allows strict foreign key constraints and robust composite unique indexes.
* **Cons:**
    * **Connection Overhead:** Traditional PostgreSQL handles active connections heavily. In a serverless setup, cold starts can pool too many connections. *Mitigation: We must use Neon's built-in connection pooling URL (`-pooler`).*

#### ⚡ Netlify Functions (Serverless API Layer)
* **Pros:**
    * **Decoupled Architecture:** Completely separates frontend assets from runtime backend logic.
    * **Zero Server Management:** Scaled automatically by Netlify based on incoming requests.
    * **Secure Environment:** Allows us to safely inject database credentials (`DATABASE_URL`) using Netlify Environment Variables instead of exposing them in client-side script files.
* **Cons:**
    * **Cold Starts:** Initial hits to an idle serverless endpoint may experience brief network latency while booting up. Given our low-frequency usage pattern (teachers logging attendance at specific intervals), this is highly acceptable.

### Status
**APPROVED**

### Consequences
* No dedicated virtual machine (EC2/Droplet) needs to be rented or maintained.
* All data operations must go through Netlify serverless functions; direct frontend-to-database connections are strictly forbidden.
* Environment variables must be locally managed via a secured `.env` file (git-ignored) and manually added inside the Netlify Dashboard.