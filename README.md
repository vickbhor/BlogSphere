<div align="center">
  
  <img src="https://img.icons8.com/color/100/000000/blog.png" alt="BlogSphere Logo" width="100"/>

  <h1>🌐 BlogSphere: The Ultimate Full-Stack MERN Ecosystem</h1>
  
  <p>
    <b>A High-Performance, Real-Time, and Highly Scalable Blogging Platform.</b>
  </p>

  <p>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" /></a>
    <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express" /></a>
    <a href="https://socket.io/"><img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" /></a>
  </p>

  <p>
    <a href="#-project-overview">Overview</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-getting-started">Installation</a> •
    <a href="#-api-documentation">API Docs</a>
  </p>

</div>

---

## 🚀 Project Overview

**BlogSphere** is not just a standard blog; it is a full-fledged content creation ecosystem engineered for modern web standards. Built completely from scratch using the **MERN Stack**, it breaks the boundaries of traditional web apps by seamlessly integrating **WebSockets for real-time engagement** and **Cloud infrastructure for media management**. 

Whether you are building a community, sharing technical articles, or managing a portfolio, BlogSphere guarantees a lightning-fast, distraction-free, and highly secure user experience.

---

## ✨ Key Features (Limit Pushed)

### 🔐 Enterprise-Grade Security & Authentication
- **Stateless JWT Authentication:** Secure, HTTP-only cookies prevent XSS attacks.
- **Robust OTP Verification:** Email-based One-Time Password system powered by Nodemailer for bulletproof registration and password recovery.
- **Advanced RBAC:** Middleware-driven Role-Based Access Control to protect sensitive API routes.

### ⚡ Real-Time Engine & Social Networking
- **Live WebSockets:** Powered by `Socket.io`, users experience zero-latency live commenting. See discussions unfold in real-time without refreshing the page.
- **Dynamic Follower Graph:** A built-in networking system allowing users to follow their favorite authors and curate personalized content feeds.
- **Content Bookmarking:** Instantly save and organize favorite posts for later reading.

### 🎨 Next-Generation UI/UX 
- **Fluid & Cinematic Animations:** Scroll interactions and page transitions powered by `Framer Motion` and `Lenis Scroll` for a buttery-smooth experience.
- **Perceived Performance optimization:** Premium `Shadcn UI` skeleton loading states that keep users engaged while data is fetched.
- **Native Theming:** System-aware Dark and Light mode toggles utilizing React Context API.
- **Fully Responsive:** Pixel-perfect layouts from mobile screens to ultra-wide desktop monitors.

### ☁️ Cloud-Optimized Media
- **ImageKit Infrastructure:** Bypassing standard local uploads, all media (avatars, blog thumbnails) are instantly piped to ImageKit for on-the-fly optimization, dynamic resizing, and CDN-backed fast delivery.

---

## 🛠️ Comprehensive Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Core** | React.js (Vite), React Router DOM, Context API |
| **Styling & UI** | Tailwind CSS, Shadcn UI, Framer Motion, Lucide Icons |
| **Backend Core** | Node.js, Express.js |
| **Database & ORM**| MongoDB Atlas, Mongoose |
| **Real-Time Data**| Socket.io |
| **Cloud & Utils** | ImageKit.io (Media CDN), Nodemailer (SMTP), Axios |
| **Security** | JSON Web Tokens (JWT), Bcrypt.js, CORS |

---

## 📂 System Architecture (Monorepo)

```text
BlogSphere/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable atomic UI components
│   │   ├── context/            # Global state management
│   │   ├── hooks/              # Custom React hooks (useFollow, useAuth)
│   │   ├── pages/              # Core route views
│   │   └── services/           # Axios API interceptors & endpoints
│   └── tailwind.config.js      # Custom theme configuration
│
├── server/                     # Backend API & WebSocket Engine
│   ├── src/
│   │   ├── controllers/        # Request handlers & core business logic
│   │   ├── models/             # Mongoose schemas (User, Post, Comment)
│   │   ├── middlewares/        # JWT validation, error handling
│   │   ├── routes/             # RESTful route definitions
│   │   └── utils/              # Email templates, token generators
│   └── server.js               # Express app & Socket.io initialization
└── README.md

```

---

## ⚙️ Environment Configuration

To run this application, you must configure your environment variables. Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/blogsphere

# Security Credentials
JWT_SECRET=your_ultra_secure_jwt_secret
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# ImageKit Cloud (Media Management)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=[https://ik.imagekit.io/your_endpoint](https://ik.imagekit.io/your_endpoint)

# Nodemailer SMTP (Email Services)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

```

---

## 💻 Getting Started (Local Development)

Follow these steps to boot up the entire ecosystem on your local machine.

### 1. Clone the Repository

```bash
git clone [https://github.com/vickbhor/BlogSphere.git](https://github.com/vickbhor/BlogSphere.git)
cd BlogSphere

```

### 2. Initialize the Backend

```bash
cd server
npm install
# Ensure your .env file is set up here
npm run dev

```

*> The backend engine will ignite at `http://localhost:5000*`

### 3. Initialize the Frontend

Open a new terminal session:

```bash
cd client
npm install
npm run dev

```

*> The frontend application will be live at `http://localhost:5173*`

---

## 📡 API Documentation

Below is a quick reference to the core RESTful API endpoints.

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Register a new user | ❌ |
| `POST` | `/api/v1/auth/login` | Authenticate user & get token | ❌ |
| `POST` | `/api/v1/auth/verify-otp` | Verify email via OTP | ❌ |
| `GET` | `/api/v1/auth/me` | Fetch current user profile | ✅ |
| `GET` | `/api/v1/auth/logout` | Clear HTTP cookies | ✅ |

### Post & Content Endpoints

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/api/v1/posts/` | Fetch all posts (supports query/pagination) | ❌ |
| `GET` | `/api/v1/posts/:id` | Fetch specific post details | ❌ |
| `POST` | `/api/v1/posts/` | Create a new blog post | ✅ |
| `PUT` | `/api/v1/posts/:id` | Update an existing post | ✅ |
| `DELETE` | `/api/v1/posts/:id` | Delete a post | ✅ |

### Interaction Endpoints (WebSockets operate on `/`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/v1/comments/` | Add a comment to a post | ✅ |
| `GET` | `/api/v1/comments/:postId` | Fetch all comments for a post | ❌ |
| `POST` | `/api/v1/users/follow/:id` | Follow / Unfollow an author | ✅ |

---
