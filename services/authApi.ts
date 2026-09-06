import { User } from '@/types';
import { 
  loginWithZitadel, 
  signupWithZitadel, 
  logoutFromZitadel, 
  handleAuthCallback, 
  handleSignupCallback,
  getAuthIntent,
  clearAuthIntent
} from '@/lib/auth/zitadelAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export { 
  loginWithZitadel, 
  signupWithZitadel, 
  logoutFromZitadel, 
  handleAuthCallback, 
  handleSignupCallback,
  getAuthIntent,
  clearAuthIntent
};

/**
 * Syncs user profile with backend via API Gateway (:9090)
 */
export async function syncUserProfile(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/users/sync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to sync user profile with backend');
  }

  return await response.json();
}

/**
 * Fetches authenticated user profile from backend via API Gateway (:9090)
 */
export async function getCurrentUserProfile(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return await response.json();
}
