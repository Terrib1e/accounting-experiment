Here is a comprehensive `README.md` generated based on the file structure and code contents of the project.

---

# Accounting Platform Experiment

A full-stack, comprehensive accounting and business management platform designed to handle double-entry bookkeeping, workflow management, and client interactions. This project demonstrates a modern microservice-ready architecture using **Spring Boot** for the backend and **Angular** for the frontend.

## 🚀 Features

The application is modularized into several key business domains:

### 📖 General Accounting

* **Double-Entry Bookkeeping:** Robust journal entry system ensuring books always balance.
* **Chart of Accounts:** Hierarchical account management with support for various account types and subtypes.
* **Fiscal Periods:** Management of accounting periods and closing processes.
* **Tax Rates:** Configurable tax rates for invoices and expenses.

### 💰 Sales & Purchases

* **Invoicing:** Create, send, and track invoices. Support for payments and status tracking.
* **Expenses:** Track business expenses with line-item details and receipt association.
* **Documents:** Upload and manage attachments related to transactions.

### 👥 CRM & Portal

* **Contact Management:** Manage Customers, Vendors, and Employees.
* **Client Portal:** A dedicated interface for clients to view their dashboard, invoices, and active jobs.

### 🏦 Banking

* **Bank Accounts:** Manage multiple bank accounts.
* **Transactions:** Track bank transactions.
* **Reconciliation:** Tools to reconcile internal records with bank statements.

### ⏱️ Time Tracking & Workflow

* **Time Entries:** Track billable and non-billable time.
* **Timer:** Real-time stopwatch for tasks.
* **Workflow Management:** Kanban-style job board, task management, and workflow stages.
* **Invoicing Integration:** Generate invoices directly from billable time entries.

### 📊 Reporting

* **Financial Reports:** Generate standard reports (likely Income Statement, Balance Sheet).
* **Aging Reports:** Accounts Receivable/Payable aging analysis.
* **Dashboard:** Real-time statistics and activity streams.

### 🔐 Security

* **Authentication:** Secure login using JWT (JSON Web Tokens).
* **MFA:** Multi-Factor Authentication support.
* **RBAC:** Role-Based Access Control.
* **Audit Logging:** Comprehensive tracking of user actions and system changes.

---

## 🛠️ Tech Stack

### Backend

* **Language:** Java
* **Framework:** Spring Boot 3+
* **Database:** PostgreSQL (implied via Docker/Liquibase)
* **ORM:** Spring Data JPA / Hibernate
* **Migrations:** Liquibase (`src/main/resources/db/changelog`)
* **Security:** Spring Security, JWT
* **Build Tool:** Maven

### Frontend

* **Framework:** Angular
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **State/Data:** RxJS
* **Build Tool:** NPM / Angular CLI

### Infrastructure

* **Containerization:** Docker & Docker Compose

---

## 🏁 Getting Started

### Prerequisites

* [Docker Desktop](https://www.docker.com/products/docker-desktop) (Recommended)
* **OR**
* Java JDK 17+
* Node.js & NPM
* PostgreSQL Database



### 🐳 Running with Docker (Recommended)

The easiest way to spin up the entire stack (Database, Backend, and Frontend) is using Docker Compose.

1. Clone the repository.
2. Navigate to the project root.
3. Run the following command:

```bash
docker-compose up --build

```

This will start:

* The PostgreSQL database.
* The Spring Boot Backend (likely on port `8080`).
* The Angular Frontend (likely on port `80` or `4200`).

### 🔧 Manual Setup

#### Backend

1. Navigate to the `backend` directory.
2. Ensure you have a PostgreSQL database running and configured in `src/main/resources/application.yml` (or `application-dev.yml`).
3. Run the application:

```bash
./mvnw spring-boot:run

```

#### Frontend

1. Navigate to the `frontend` directory.
2. Install dependencies:

```bash
npm install

```

3. Start the development server:

```bash
npm start

```

4. Navigate to `http://localhost:4200`.

---

## 📂 Project Structure

```text
├── backend/                 # Spring Boot Application
│   ├── src/main/java/       # Source code organized by feature (account, invoice, etc.)
│   ├── src/main/resources/  # Config and Liquibase migrations
│   └── Dockerfile           # Backend container definition
├── frontend/                # Angular Application
│   ├── src/app/features/    # Components organized by domain (auth, banking, workflow, etc.)
│   ├── src/app/core/        # Services, Guards, Interceptors, Models
│   └── Dockerfile           # Frontend container definition
└── docker-compose.yml       # Orchestration for DB, Backend, and Frontend

```

## 🧪 Development

### Database Migrations

This project uses **Liquibase** for database schema changes. Migration files are located in `backend/src/main/resources/db/changelog`. The application automatically applies changes on startup.

### Seeding Data

The application includes seeders (e.g., `ChartOfAccountsSeeder`, `ClientUserSeeder`) that populate the database with initial data for development and testing purposes.

---
