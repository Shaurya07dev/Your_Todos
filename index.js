import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from 'public' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Supabase client setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// --- Auth Middleware ---
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Missing or invalid auth header');
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  console.log('Token:', token);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  console.log('User from token:', user, 'Error:', error);
  if (error || !user) {
    console.log('Invalid token or user not found');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.user = user;
  next();
}

// --- Admin Middleware ---
async function requireAdmin(req, res, next) {
  // Check if user is admin in users table
  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', req.user.id)
    .single();
  if (error || !data || !data.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// --- Todos API ---
const todosRouter = express.Router();

todosRouter.use(authenticate);

todosRouter.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

todosRouter.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const { data, error } = await supabase
    .from('todos')
    .insert({ user_id: req.user.id, title, completed: false })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

todosRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const update = {};
  if (title !== undefined) update.title = title;
  if (completed !== undefined) update.completed = completed;
  if (Object.keys(update).length === 0) return res.status(400).json({ error: 'No fields to update' });
  const { data, error } = await supabase
    .from('todos')
    .update(update)
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

todosRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

app.use('/api/todos', todosRouter);

// --- Users API (Admin only) ---
const usersRouter = express.Router();

usersRouter.use(authenticate, requireAdmin);

usersRouter.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, is_admin, created_at, name, avatar_url, last_sign_in_at, role');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

usersRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { is_admin, role } = req.body;
  const update = {};
  if (is_admin !== undefined) update.is_admin = is_admin;
  if (role !== undefined) update.role = role;
  if (Object.keys(update).length === 0) return res.status(400).json({ error: 'No fields to update' });
  const { data, error } = await supabase
    .from('users')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

usersRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

app.use('/api/users', usersRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
