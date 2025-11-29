// Simple auth utility functions (no library needed)

export interface User {
  nip: string;
  nama: string;
  role: "guru" | "admin" | "kepsek";
  jurusan?: string;
  kelas?: string[];
  mapel?: string[];
}

// Get current logged in user
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}

// Get auth token
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Logout user
export function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('authToken');
  window.location.href = '/';
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getCurrentUser();
}

// Check user role
export function hasRole(role: string): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}