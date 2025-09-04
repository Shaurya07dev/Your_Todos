// Use Supabase JS client from CDN
const SUPABASE_URL = 'https://nepasrsjsvsfogoqrytp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcGFzcnNqc3ZzZm9nb3FyeXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NTkyNzMsImV4cCI6MjA3MjUzNTI3M30.uhadmNCP0WlIqnTITm1IoE5Lhi-9gjnGZq3oIO69i3M';

// Configure Supabase with proper redirect URL
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    redirectTo: window.location.origin
  }
});

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const addTodoForm = document.getElementById('add-todo-form');
const todoList = document.getElementById('todo-list');

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

// Show/hide login/logout buttons based on auth state
function updateAuthUI(user) {
  if (user) {
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    addTodoForm.classList.remove('hidden');
  } else {
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    addTodoForm.classList.add('hidden');
  }
}

// Track if we're currently fetching to prevent duplicate calls
let isFetching = false;
let fetchTimeout = null;

// Debounced fetch function to prevent rapid successive calls
function debouncedFetchTodos() {
  if (fetchTimeout) {
    clearTimeout(fetchTimeout);
  }
  fetchTimeout = setTimeout(() => {
    fetchTodos();
  }, 100);
}

// Fetch and render todos for the logged-in user
async function fetchTodos() {
  if (isFetching) {
    console.log('Already fetching todos, skipping...');
    return;
  }
  
  isFetching = true;
  todoList.innerHTML = '';
  const token = await getToken();
  console.log('Fetching todos with token:', token);
  if (!token) {
    console.log('No token found for fetching todos');
    isFetching = false;
    return;
  }
  try {
    const res = await fetch('/api/todos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Fetch todos response status:', res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Fetch todos error:', errorText);
      todoList.innerHTML = '<li class="text-red-500">Failed to load todos.</li>';
      return;
    }
    const data = await res.json();
    console.log('Fetched todos:', data);
    if (data.length === 0) {
      todoList.innerHTML = '<li class="text-gray-500">No todos yet. Add one above!</li>';
      return;
    }
    data.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between bg-gray-50 p-2 rounded';
      li.innerHTML = `
        <span class="${todo.completed ? 'line-through text-gray-400' : ''}">${todo.title}</span>
        <button class="text-sm text-green-600" onclick="completeTodo('${todo.id}')">✔</button>
        <button class="text-sm text-red-600" onclick="deleteTodo('${todo.id}')">🗑</button>
      `;
      todoList.appendChild(li);
    });
  } catch (err) {
    todoList.innerHTML = '<li class="text-red-500">Error loading todos.</li>';
    console.error(err);
  } finally {
    isFetching = false;
  }
}

// Add new todo
addTodoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = await getToken();
  console.log('Token:', token);
  if (!token) {
    alert('No authentication token found. Please log in again.');
    return;
  }
  const title = document.getElementById('todo-title').value.trim();
  if (!title) return;
  console.log('Adding todo:', title);
  try {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title })
    });
    console.log('Response status:', res.status);
    if (!res.ok) {
      const err = await res.json();
      console.error('Error response:', err);
      alert('Failed to add todo: ' + (err.error || res.status));
      return;
    }
    const data = await res.json();
    console.log('Todo added successfully:', data);
    debouncedFetchTodos();
    addTodoForm.reset();
  } catch (err) {
    alert('Error adding todo');
    console.error(err);
  }
});

// Complete todo
window.completeTodo = async (id) => {
  const token = await getToken();
  if (!token) return;
  try {
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ completed: true })
    });
    debouncedFetchTodos();
  } catch (err) {
    alert('Error completing todo');
    console.error(err);
  }
};

// Delete todo
window.deleteTodo = async (id) => {
  const token = await getToken();
  if (!token) return;
  try {
    await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    debouncedFetchTodos();
  } catch (err) {
    alert('Error deleting todo');
    console.error(err);
  }
};

// Auth event listeners
loginBtn.addEventListener('click', async () => {
  await supabase.auth.signInWithOAuth({ provider: 'google' });
});
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  updateAuthUI(null);
  todoList.innerHTML = '';
});

// Track if we've already initialized to prevent duplicate calls
let isInitialized = false;

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state change:', event, session?.user?.id);
  updateAuthUI(session?.user);
  if (session?.user && event === 'SIGNED_IN') {
    debouncedFetchTodos();
  } else if (event === 'SIGNED_OUT') {
    todoList.innerHTML = '';
  }
});

// Initialize auth state on page load
supabase.auth.getSession().then(({ data: { session } }) => {
  if (!isInitialized) {
    isInitialized = true;
    console.log('Initial session:', session?.user?.id);
    updateAuthUI(session?.user);
    if (session?.user) debouncedFetchTodos();
  }
});
