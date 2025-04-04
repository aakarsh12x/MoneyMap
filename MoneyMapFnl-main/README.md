# MoneyMap - Finance Management System

A mobile-optimized finance management system built with Next.js, Supabase, and Clerk Authentication.

## Features

- Budget management
- Expense tracking
- Income tracking
- Mobile-friendly UI
- User authentication with Clerk

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd MoneyMapFnl-main
```

2. Install dependencies

```bash
npm install
```

3. Set up the database

To set up the Supabase database tables, run:

```bash
npm run db:setup
```

This will create all necessary tables in your Supabase project.

Alternatively, you can use:

```bash
npm run db:init
```

Or use Drizzle ORM directly:

```bash
npm run db:push
```

4. Start the development server

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Configuration

The Supabase database connection is configured in the following files:

- `utils/dbConfig.jsx` - Main database configuration
- `drizzle.config.js` - Drizzle ORM configuration

## Project Structure

- `app/` - Next.js application code
- `app/(routes)/dashboard/` - Dashboard routes
- `components/` - Reusable UI components
- `utils/` - Utility functions and database configuration

## Mobile Optimization

This application is fully optimized for mobile devices with:

- Responsive layout
- Mobile navigation
- Touch-friendly UI elements
- Card-based mobile views

## License

This project is licensed under the MIT License - see the LICENSE file for details.
