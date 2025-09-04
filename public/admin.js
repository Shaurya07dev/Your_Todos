const SUPABASE_URL = 'https://nepasrsjsvsfogoqrytp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcGFzcnNqc3ZzZm9nb3FyeXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NTkyNzMsImV4cCI6MjA3MjUzNTI3M30.uhadmNCP0WlIqnTITm1IoE5Lhi-9gjnGZq3oIO69i3M';

// Configure Supabase with proper redirect URL
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    redirectTo: window.location.origin
  }
});

const userTable = document.getElementById('user-table');

// Helper: Get current session token
async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

// Render users in table
function renderUsers(users) {
  userTable.innerHTML = '';
  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-4 py-2">${user.email}</td>
      <td class="px-4 py-2">${user.name || ''}</td>
      <td class="px-4 py-2">${user.role || ''}</td>
      <td class="px-4 py-2">${user.is_admin ? '✅' : ''}</td>
      <td class="px-4 py-2 space-x-2">
        <button class="text-xs px-2 py-1 rounded ${user.is_admin ? 'bg-yellow-400' : 'bg-green-400'} text-white" onclick="toggleAdmin('${user.id}', ${user.is_admin})">${user.is_admin ? 'Demote' : 'Promote'}</button>
        <button class="text-xs px-2 py-1 rounded bg-red-500 text-white" onclick="deleteUser('${user.id}')">Delete</button>
      </td>
    `;
    userTable.appendChild(tr);
  });
}

// Fetch all users (admin only)
async function fetchUsers() {
  const token = await getToken();
  if (!token) return showError('Not authenticated. Please log in as admin.');
  const res = await fetch('/api/users', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 403) return showError('Admin access required.');
  if (!res.ok) return showError('Failed to fetch users.');
  const users = await res.json();
  renderUsers(users);
}

// Promote/demote admin
window.toggleAdmin = async (id, isAdmin) => {
  const token = await getToken();
  if (!token) return;
  await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ is_admin: !isAdmin })
  });
  fetchUsers();
};

// Delete user
window.deleteUser = async (id) => {
  const token = await getToken();
  if (!token) return;
  await fetch(`/api/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  fetchUsers();
};

// Show error message
function showError(msg) {
  userTable.innerHTML = `<tr><td colspan="5" class="text-red-500 p-4">${msg}</td></tr>`;
}

// Auth check and fetch users on load
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) fetchUsers();
  else showError('Not authenticated. Please log in as admin.');
});

// Initialize auth state on page load
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) fetchUsers();
  else showError('Not authenticated. Please log in as admin.');
});
