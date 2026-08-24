/**
 * Auth API Service Layer — College Knowledge Assistant
 * Handles all authentication calls to Python FastAPI backend.
 * Uses credentials: 'include' for httpOnly cookie management.
 */

const getAuthBaseUrl = () => {
  if (import.meta.env.VITE_AUTH_API_URL) return import.meta.env.VITE_AUTH_API_URL.replace(/\/$/, '');
  if (import.meta.env.VITE_BACKEND_URL) return `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}/auth`;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://127.0.0.1:8000/auth';
  }
  return 'https://college-chatbot-backend-cbox.onrender.com/auth';
};

export async function registerUser(data) {
  try {
    const response = await fetch(`${getAuthBaseUrl()}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.detail || 'Registration failed');
    }
    return resData;
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the authentication service. Please try again.');
    }
    throw error;
  }
}

export async function loginUser(data) {
  try {
    const response = await fetch(`${getAuthBaseUrl()}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.detail || 'Invalid email or password.');
    }
    return resData;
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the authentication service. Please try again.');
    }
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetch(`${getAuthBaseUrl()}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }
    const resData = await response.json();
    return resData.authenticated ? resData.user : null;
  } catch (error) {
    return null;
  }
}

export async function logoutUser() {
  try {
    const response = await fetch(`${getAuthBaseUrl()}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const resData = await response.json();
    return resData;
  } catch (error) {
    return { success: true };
  }
}

export function startGoogleLogin() {
  window.location.href = `${getAuthBaseUrl()}/google`;
}

export async function syncGoogleUser(data) {
  try {
    const response = await fetch(`${getAuthBaseUrl()}/google-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    return resData;
  } catch (error) {
    console.warn('Backend Google sync note:', error);
    return null;
  }
}
