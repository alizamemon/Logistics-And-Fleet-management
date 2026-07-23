# 🚚 Enterprise Logistics & Fleet Management System

A robust, enterprise-grade full-stack logistics and fleet tracking application built with **Spring Boot** and **React**. The system provides real-time role-based access control (RBAC), automated vehicle dispatching, driver management, trip monitoring, and audit logging.

---

## 🏗️ System Architecture & Workflow

The platform follows a layered production architecture designed for high availability and scalable deployment on AWS:

+-------------------------------------------------------------------------------+
|                                FRONTEND TIER                                  |
|   +-----------------------------------------------------------------------+   |
|   |                   User Access Tiers (Web / Mobile)                   |   |
|   +-----------------------------------------------------------------------+   |
+-----------------------------------++------------------------------------------+
|| HTTPS + Bearer JWT
/
+-------------------------------------------------------------------------------+
|                            AWS PRODUCTION ENVIRONMENT                         |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                     Load Balancer (AWS ALB)                             |  |
|  +------------------------------------++-----------------------------------+  |
|                                       ||                                      |
|  +------------------------------------/----------------------------------+  |
|  | Security Layer: NGINX Reverse Proxy & JWT Auth Filter                  |  |
|  +------------------------------------++-----------------------------------+  |
|                                       || Verified Requests                    |
|  +------------------------------------/----------------------------------+  |
|  | App Layer: Spring Boot Enterprise Core                                 |  |
|  |   * REST Controllers (API Gateway)                                     |  |
|  |   * Service Layer (Trip Allocation Logic, Fuel & Maintenance Engine)   |  |
|  |   * Data Repositories (JPA / Hibernate)                                |  |
|  +------------------------------------++-----------------------------------+  |
|                                       || Data Access                          |
|  +------------------------------------/----------------------------------+  |
|  | Data Layer: AWS RDS (MySQL - 10 Relational Tables)                      |  |
|  |   * Cluster 1: User, Auth & IAM Role Tables                            |  |
|  |   * Cluster 2: Fleet & Vehicle Management Tables                        |  |
|  |   * Cluster 3: Trip Manifests & Logistics Tables                        |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+


---

## ✨ Features & Capabilities

### 🔐 Multi-Role Access Control (RBAC)
* **ADMIN:** Complete system oversight, Identity & Access Management (IAM), user role promotions, fleet asset configurations, and global system audit logs.
* **EMPLOYEE / DISPATCHER:** Logistics Operations Hub, shipment booking, vehicle allocation, driver assignment, and real-time trip manifest dispatching.
* **DRIVER:** Personal trips dashboard, vehicle onboarding status, route updates, and availability toggles.
* **CUSTOMER / USER:** Shipment booking requests and live cargo tracking.

### 🚛 Core Modules
* **Logistics Operations Hub:** End-to-end management of active dispatches, maintenance auto-triggers, fuel calculation metrics, and trip lifecycle states.
* **Vehicle & Driver Management:** Driver-to-vehicle mapping, status monitoring (Available, In-Transit, Maintenance), and asset health logs.
* **Audit & Compliance:** Detailed activity logging across all nodes for security and system parameters tracking.

---

## 🛠️ Tech Stack & Tools

* **Frontend:** React.js, Tailwind CSS, Lucide / Emoji Icons, Vite / Create React App
* **Backend:** Java 17+, Spring Boot, Spring Security (JWT), Spring Data JPA, Hibernate
* **Database:** MySQL 8.0 (10 Relational Tables)
* **Build Tools & Environment:** Maven (`pom.xml`), Git, Node.js

---

## 📂 Project Structure

```text
Logistics/
├── Backend/                 # Spring Boot Enterprise Application
│   ├── src/                 # Controllers, Services, Repositories, Entities, Security
│   ├── .mvn/                # Maven Wrapper configurations
│   ├── pom.xml              # Spring Boot Dependencies & Plugins
│   └── mvnw                 # Executable Maven Wrapper
├── frontend/                # React Dashboard Application
│   ├── src/                 # Components, Pages, State Management, API Services
│   ├── package.json         # Frontend Dependencies
│   └── tailwind.config.js   # UI Styling Configs
├── logistics_db.sql         # Database Schema Dump / Initialization Scripts
├── logistics_ERD.png        # Entity Relationship Diagram
└── README.md                # Project Documentation
```

##  Getting Started
Prerequisites
Java Development Kit (JDK 17 or higher)

Node.js (v18+) and npm

MySQL Server (v8.0+)

## 1. Database Setup
Open your MySQL client (e.g., MySQL Workbench).

Create a database named logistics_db.

Import and execute the provided logistics_db.sql file.

##  2. Backend Setup (Spring Boot)
### Navigate to the Backend directory:

```
cd Backend
```
### Configure your MySQL credentials in src/main/resources/application.properties:

```
Properties
spring.datasource.url=jdbc:mysql://localhost:3306/logistics_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

```

### Run the Spring Boot application:

```
./mvnw spring-boot:run
```

The backend server will start on http://localhost:8080.

## 3. Frontend Setup (React)
Navigate to the frontend directory:

```
cd ../frontend
Install dependencies:
```

```
npm install
Launch the development server:
```

```
npm run dev
```

The frontend application will start on http://localhost:3000 or http://localhost:5173.

### 📄 API Specifications SummaryEndpoint DomainMethodTarget ScopeDescription/api/auth/**POSTPublicRegister, Login, JWT Generation/api/admin/**GET/POST/PUTROLE_ADMINIAM Node Modifications, System Logs/api/ops/**GET/POST/PUTADMIN / EMPLOYEETrip Creation, Vehicle Assignments/api/driver/**GET/PUTROLE_DRIVERActive Manifests & Availability Updates
