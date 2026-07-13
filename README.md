# Skillzy — Full-Stack Interactive Learning Platform

Skillzy is a state-of-the-art interactive learning management system (LMS) and coding education platform built with Next.js. It features a curriculum builder for instructors, coding execution labs for students, and full local payment integration.

---

## 🚀 Key Features

* **Student Learn Workspace**: Premium learning dashboard featuring collapsible curriculum sidebars, glowing status badges, paginated text reading steps, and smooth scroll resets.
* **Interactive Coding Labs**: Browser-based coding exercises with a Monaco editor, execution logs, run controls, and instant code feedback.
* **Instructor Course Builder**: Visual course outline editor supporting drag-to-reorder for both modules and lessons, collapsible navigation, and inline creation controls.
* **Payment Integration**: Local standard payment checkout utilizing Razorpay directly in INR (₹).
* **Caching Layer**: Redis database caching for curriculum queries with automatic invalidate hooks on content mutations.
* **Secure Auth**: Authentication and middleware protection powered by Clerk.

---

## 🛠️ Tech Stack

* **Framework**: Next.js (App Router)
* **Language**: TypeScript
* **Database & ORM**: PostgreSQL & Prisma ORM
* **Cache**: Redis
* **Styling**: Vanilla CSS (Tailwind-free for maximum layout control)
* **Auth**: Clerk
* **Payments**: Razorpay

---

## 💻 Getting Started (Local Development)

### Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v20+ recommended)
* [PostgreSQL](https://www.postgresql.org/) (local server or remote instance)
* [Redis](https://redis.io/) (running locally or a cloud server)

---

### Step 1: Install Dependencies
Clone the repository, navigate to the folder, and install the npm packages:
```bash
npm install
```

---

### Step 2: Configure Environment Variables
Create a `.env` file at the root of the project and populate the following keys:
```env
# Database Connections
DATABASE_URL="postgresql://user:password@localhost:5432/skillzy?schema=public"

# Redis Cache Connection
REDIS_URL="redis://localhost:6379"

# Clerk Auth Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Webhook secret (for Clerk event sync)
CLERK_WEBHOOK_SECRET=whsec_...
```

---

### Step 3: Database Initialization
Run Prisma migrations to sync the database schema and seed the initial interactive courses:
```bash
# Push schema changes to Database
npx prisma db push

# Seed initial courses and steps
npx prisma db seed
```

---

### Step 4: Run Development Server
Start the Next.js development server locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the platform.