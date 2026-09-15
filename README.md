<div align="center">
  
  <img src="https://via.placeholder.com/1000x300/2563eb/ffffff?text=Taskify+Dashboard" alt="Taskify Banner" width="100%" style="border-radius: 15px;"/>

  <h1>🚀 Taskify - Project Management Dashboard</h1>
  <p><em>A modern, highly responsive, and feature-rich workspace for teams and individuals.</em></p>

  <!-- Premium Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white" alt="Redux" />
  </p>

</div>

---

## ✦ About The Project

**Taskify** is a premium project and task management dashboard designed with a **Mobile-First** approach. It provides a seamless, intuitive, and visually appealing user experience across all devices (Desktop, Tablet, and Mobile). Built with a robust MERN-stack architecture and TypeScript, it ensures high performance, security, and scalability.

---

## ✨ Premium Features

*   📱 **Fully Responsive UI:** Pixel-perfect design optimized for all screen sizes using React-Bootstrap.
*   📅 **Dynamic Smart Calendar:** Visually track project deadlines and task due dates with intuitive color-coded indicators (🟢 Projects, 🔴 Tasks).
*   🔔 **Advanced Notification System:** Real-time dropdown and a dedicated notification hub with 'All' and 'Unread' smart filters.
*   🔐 **Enterprise-Grade Security:** JWT-based authentication, secure session management, and auto-logout mechanisms.
*   🎨 **Modern Design System:** Clean aesthetics, custom typography, and smooth CSS transitions/hover effects.
*   🗂 **Predictable State Management:** Centralized and efficient data handling via Redux Toolkit.

---

## 🛠️ Technology Stack

| Frontend               | Backend & Database       | Tools & Libraries          |
| :--------------------- | :----------------------- | :------------------------- |
| React.js (v18+)        | Node.js                  | Redux Toolkit              |
| TypeScript             | Express.js               | React-Bootstrap            |
| React Router DOM       | MongoDB (Mongoose)       | React Icons (Feather/Fa)   |
| Custom CSS             | JSON Web Tokens (JWT)    | Vite (Bundler)             |

---

## 📂 Architecture & Structure

```text
Taskify/
├── backend/               # Node.js & Express Backend API
│   ├── src/               # Controllers, Models, Routes, Middlewares
│   └── .env               # Backend Secret Keys (Not uploaded)
│
└── taskify/               # React & TypeScript Frontend
    ├── public/            # Static Assets & Branding
    ├── src/
    │   ├── components/    # Reusable UI Components (Avatars, Modals)
    │   ├── pages/         # Dashboard, Calendar, Notifications, Settings
    │   ├── redux/         # Slices & Global Store
    │   └── App.tsx        # Application Root & Routing
    ├── package.json       # Frontend Dependencies
    └── .env               # Frontend Environment Variables