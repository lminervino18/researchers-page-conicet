# Researchers Page - CONICET

Researchers Page - CONICET is a web platform designed to showcase the work of researchers affiliated with CONICET (Consejo Nacional de Investigaciones Científicas y Técnicas, Argentina). It aims to centralize and disseminate scientific production, team information, and opportunities for public engagement.

---

## Project Overview

The platform is structured into the following main sections:

- **Landing Page:** Introductory section presenting the research group and the purpose of the website.
- **Research Lines:** Details about the scientific areas and research objectives of the group.
- **Members:** Directory of team members, including their roles, affiliations, and profiles.
- **Publications:** A catalog of scientific articles and academic contributions by the group.
- **Experiment Participation:** A space where individuals can register to participate in ongoing research studies.
- **Analogy Inbox:** A more informal section where researchers can publish thoughts or analogies related to their work. This section includes a basic email-based login system and a comment system.
- **News:** A section with announcements about courses, events, and updates relevant to the group.

Additionally, the homepage features a photo gallery of the research team.

---

## Technologies Used

### Frontend (React + TypeScript)
- **React:** Component-based UI development
- **TypeScript:** Type-safe JavaScript for enhanced maintainability
- **Vite:** Build tool for fast development and optimized bundling
- **CSS Modules / TailwindCSS:** Styling solutions for scalable and reusable design
- **React Router:** Client-side navigation
- **Axios:** HTTP client for API communication

### Backend (Spring Boot + Java)
- **Spring Boot:** Framework for building RESTful Java applications
- **Spring Data JPA:** Abstraction layer for database operations
- **MySQL:** Relational database
- **Spring Security (optional):** Authentication and authorization layer
- **REST API:** Interfaces to exchange data between frontend and backend

---

## Infrastructure and Deployment

- **Frontend:** Deployed on Vercel
- **Backend:** Deployed using Railway
- **Database:** Cloud-based MySQL instance via Railway
- **Image Storage:** Firebase Storage used for uploading and hosting media assets (e.g., profile pictures, gallery images)

---

## Development Setup

To run the application locally:

```bash
# Grant execution permission (first time only)
chmod +x start-dev.sh

# Launch all services (frontend, backend, database)
./start-dev.sh
```