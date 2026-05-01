/**
 * API Utility - Frontend request handler
 * Manages communication with the Node.js backend
 * Handles authentication tokens and error responses
 */

const API_BASE = '/api';

// Store auth token in memory and localStorage
let authToken = localStorage.getItem('authToken') || null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('authToken');
};

/**
 * Generic fetch wrapper with error handling
 */
const fetchAPI = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Guard against non-JSON responses (proxy errors, server not running, etc.)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Cannot reach the backend server. Make sure it is running on port 5000.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data.data || data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error.message);
    throw error;
  }
};

// ─── AUTH ENDPOINTS ────────────────────────────────────────────────────────────

export const authAPI = {
  register: (name, email, password, department, role) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, department, role }),
    }),

  login: (email, password) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ─── USER ENDPOINTS ────────────────────────────────────────────────────────────

export const userAPI = {
  getAllUsers: () => fetchAPI('/users'),

  getUserById: (id) => fetchAPI(`/users/${id}`),

  updateUserRole: (id, role) =>
    fetchAPI(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
};

// ─── EVENT ENDPOINTS ────────────────────────────────────────────────────────────

export const eventAPI = {
  getAllEvents: () => fetchAPI('/events'),

  getEventById: (id) => fetchAPI(`/events/${id}`),

  createEvent: (eventData) =>
    fetchAPI('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  updateEvent: (id, eventData) =>
    fetchAPI(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),

  deleteEvent: (id) =>
    fetchAPI(`/events/${id}`, {
      method: 'DELETE',
    }),
};

// ─── VENUE ENDPOINTS ────────────────────────────────────────────────────────────

export const venueAPI = {
  getAllVenues: () => fetchAPI('/venues'),

  getVenueById: (id) => fetchAPI(`/venues/${id}`),

  createVenue: (venueData) =>
    fetchAPI('/venues', {
      method: 'POST',
      body: JSON.stringify(venueData),
    }),

  updateVenue: (id, venueData) =>
    fetchAPI(`/venues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(venueData),
    }),

  deleteVenue: (id) =>
    fetchAPI(`/venues/${id}`, {
      method: 'DELETE',
    }),
};

// ─── APPROVAL ENDPOINTS ────────────────────────────────────────────────────────

export const approvalAPI = {
  getAllApprovals: () => fetchAPI('/approvals'),

  approveEvent: (eventId, note = '') =>
    fetchAPI(`/approvals/${eventId}`, {
      method: 'POST',
      body: JSON.stringify({ status: 'approved', note }),
    }),

  rejectEvent: (eventId, note = '') =>
    fetchAPI(`/approvals/${eventId}`, {
      method: 'POST',
      body: JSON.stringify({ status: 'rejected', note }),
    }),
};

// ─── NOTIFICATION ENDPOINTS ────────────────────────────────────────────────────

export const notificationAPI = {
  getNotifications: () => fetchAPI('/notifications'),

  markAsRead: (notificationId) =>
    fetchAPI(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: () =>
    fetchAPI('/notifications/mark-all-read', {
      method: 'PUT',
    }),
};

// ─── ANALYTICS ENDPOINTS ────────────────────────────────────────────────────

export const analyticsAPI = {
  getAnalytics: () => fetchAPI('/analytics'),
};

// ─── HEALTH CHECK ────────────────────────────────────────────────────────

export const healthCheck = () => fetchAPI('/health');
