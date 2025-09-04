# Todolist App

A full-stack todolist application built with Express.js, Supabase, and Tailwind CSS.

🌐 **Live Demo**: [https://yourr-todos.vercel.app/](https://yourr-todos.vercel.app/)

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

This app is deployed on Vercel and configured with `vercel.json` for routing API calls and static files.

**Production URL**: [https://yourr-todos.vercel.app/](https://yourr-todos.vercel.app/)

### Deployment Steps:
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Deploy automatically on every push

## Admin Access

To access the admin panel:
1. Log in with Google
2. Set `is_admin` to `true` for your user in the Supabase `users` table
3. Visit [https://yourr-todos.vercel.app/admin.html](https://yourr-todos.vercel.app/admin.html)

## Project Structure

```
todo_tool/
├── public/                 # Static files
│   ├── index.html         # Main page
│   ├── about.html         # About page
│   ├── admin.html         # Admin panel
│   ├── app.js            # Frontend JavaScript
│   ├── admin.js          # Admin panel JavaScript
│   ├── output.css        # Compiled Tailwind CSS
│   └── input.css         # Tailwind source
├── index.js              # Express.js server
├── package.json          # Dependencies
├── vercel.json          # Vercel configuration
├── tailwind.config.js   # Tailwind configuration
└── README.md            # This file
```
