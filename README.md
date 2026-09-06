# 🌿 EcoMarket — Sustainable E-Commerce Platform (Frontend)

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript/JavaScript](https://img.shields.io/badge/Language-JavaScript/ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Project Overview

**EcoMarket** is a modern e-commerce web platform designed to promote sustainable shopping by connecting eco-conscious consumers with verified eco-friendly vendors. 

This repository contains the **Frontend application** for EcoMarket, developed as a Final Year Capstone Project (FYP). The client-side application focuses on responsive UI design, seamless state management, secure authentication flows, and an intuitive shopping experience.

---

## ✨ Key Features

- **🛍️ Product Discovery & Catalog**: Filter and search eco-friendly products by category, sustainability certifications, ratings, and price range.
- **🔐 User Authentication**: Secure login, user registration, JWT token persistence, and role-based access control (Customer vs. Seller/Admin).
- **🛒 Interactive Shopping Cart & Checkout**: Real-time cart calculations, item updates, address management, and seamless checkout flow.
- **📊 Seller & Admin Dashboard**: Dedicated portal for vendors to manage product listings, track order statuses, and review sales metrics.
- **🌱 Eco-Impact Metrics**: Displays sustainability ratings and carbon footprint impact for featured products.
- **📱 Fully Responsive UI**: Optimized for desktops, tablets, and mobile devices using clean Tailwind CSS styling.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React.js
- **Styling & UI**: Tailwind CSS, Lucide / React Icons
- **State Management**: React Context API / Redux Toolkit
- **HTTP Client**: Axios (with custom interceptors for auth tokens)
- **Routing**: React Router DOM (v6)
- **Form Handling**: React Hook Form / Yup validation

---

## 🏗️ Architecture & Project Structure

```text
FrontEnd-FYPEcoMarket/
├── public/                  # Static assets and index.html
├── src/
│   ├── assets/              # Images, icons, and static branding assets
│   ├── components/          # Reusable UI components (Buttons, Navbar, Modals, Cards)
│   ├── context/             # React Context for Global State (Auth, Cart, Theme)
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Route pages (Home, ProductDetails, Cart, Checkout, Dashboard)
│   ├── services/            # API service calls and Axios configuration
│   ├── styles/              # Global styles and Tailwind imports
│   ├── utils/               # Helper functions and formatting utilities
│   ├── App.js               # Main layout and route definitions
│   └── index.js             # Application entry point
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
└── README.md
