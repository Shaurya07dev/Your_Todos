# Todolist App

A full-stack todolist application built with Express.js, Supabase, and Tailwind CSS.

## Features

- ✅ Google Authentication via Supabase
- ✅ Add, complete, and delete todos
- ✅ Admin panel for user management
- ✅ Responsive design with Tailwind CSS
- ✅ RESTful API with Express.js

## Tech Stack

- **Backend**: Express.js
- **Database & Auth**: Supabase
- **Frontend**: HTML + Tailwind CSS
- **Hosting**: Vercel

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

## Deployment

This app is configured for deployment on Vercel. The `vercel.json` file handles routing for both the API and static files.

## Admin Access

To access the admin panel:
1. Log in with Google
2. Set `is_admin` to `true` for your user in the Supabase `users` table
3. Visit `/admin.html`
