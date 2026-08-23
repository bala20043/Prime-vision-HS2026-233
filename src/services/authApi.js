/**
 * Auth API Service Layer — College Knowledge Assistant
 * Handles all authentication calls to Python FastAPI backend.
 * Uses credentials: 'include' for httpOnly cookie management.
 */

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL || '/auth';

export async function registerUser(data) {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/register`, {
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
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
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
    const response = await fetch(`${AUTH_BASE_URL}/me`, {
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
    const response = await fetch(`${AUTH_BASE_URL}/logout`, {
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
  window.location.href = `${AUTH_BASE_URL}/google`;
}

export async function syncGoogleUser(data) {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/google-sync`, {
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
