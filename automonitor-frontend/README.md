# Automonitor FrontEnd

A modern, responsive dashboard interface for the AutoMonitor system. This frontend application allows users to visualize real-time monitoring events, track changes across various sources, and inspect detailed JSON payloads of detected changes.

Built with React, Vite, and Tailwind CSS, focusing on performance and a clean user experience with dark mode support.

## Features

- **Overview Dashboard**: Real-time metrics showing total events, additions, removals, and updates.
- **Event History**: Paginated list of all detected events with filtering capabilities.
- **Deep Inspection**: Detailed view of specific events, including diff statistics and raw JSON payload viewers.
- **Responsive Design**: Fully responsive layout that works on desktop and mobile.

## Tech Stack

- **Framework**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Icons**: Custom SVG icons (minimalist dependency-free approach)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd automonitor-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure Environment Variables:
   Ensure you have a `.env` file (or `.env.local`) defining the API base URL:

   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

### Running Development Server

To start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

### Building for Production

To build the application for production deployment:

```bash
npm run build
```

This will generate optimized static assets in the `dist` directory.
