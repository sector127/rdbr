# Redberry (RDBR)

A modern, high-performance e-learning platform built for the Redberry Internship selection process. This portal provides an integrated experience for students to browse courses, track their learning progress, and manage their professional profiles.

## 🚀 Key Features

- **Interactive Course Catalog**: Comprehensive listing of courses with filtering, search, and category-based navigation.
- **Personalized Dashboard**: Track enrolled courses, view completion progress, and resume learning from where you left off.
- **Secure Authentication**: Robust sign-in/sign-up flow using NextAuth.js with JWT sessions.
- **Rich Course Details**: Detailed information including curriculum, instructor bios, ratings, and course duration.
- **Dynamic UX**: Fast, client-side transitions, loading skeletons, and responsive design for all devices.
- **Theme Support**: Seamless switching between Light and Dark modes.
- **Profile Management**: Step-by-step registration and detailed profile editor.

## 🛠️ Technology Stack

- **Core Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Icons**: Custom SVG icons
- **State Management**: Standard React hooks & URL search parameters
- **Typography**: Inter & Geist Mono

## 📂 Project Structure

- `app/`: Next.js App Router folders (Pages, API routes).
- `components/`: Modular, reusable UI components.
- `lib/`: Shared utility functions (API fetchers, auth config).
- `public/`: Static assets (Icons, logos).
- `types/`: Global TypeScript definitions.

## 🏁 Getting Started

### Prerequisites

- Node.js (v20 or newer recommended)
- npm / pnpm / yarn

### Environment Variables

Create a `./env.local` file in the root directory and configure the following:

```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXTAUTH_SECRET=your_jwt_secret
NEXTAUTH_URL=http://localhost:3000
```

### Installation & Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 License

This project is part of the Redberry Bootcamp / Internship program.

---

Built with ❤️ by the Redberry Team.
