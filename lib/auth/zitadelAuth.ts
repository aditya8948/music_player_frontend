import { UserManager, WebStorageStateStore, type User as OidcUser } from 'oidc-client-ts';
import { User } from '@/types';

const ZITADEL_ISSUER = process.env.NEXT_PUBLIC_ZITADEL_ISSUER || 'https://musekit-oua2yk.us1.zitadel.cloud';
const CLIENT_ID = process.env.NEXT_PUBLIC_ZITADEL_CLIENT_ID || '389546719580380515';
const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';

let userManagerInstance: UserManager | null = null;
let inFlightCallbackPromise: Promise<User | null> | null = null;

export function getUserManager(): UserManager | null {
  if (typeof window === 'undefined') return null;

  if (!userManagerInstance) {
    const origin = window.location.origin;
    userManagerInstance = new UserManager({
      authority: ZITADEL_ISSUER,
      client_id: CLIENT_ID,
      redirect_uri: `${origin}/callback`,
      post_logout_redirect_uri: origin,
      response_type: 'code',
      scope: 'openid profile email',
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
      filterProtocolClaims: true,
      loadUserInfo: true,
    });
  }

  return userManagerInstance;
}

/**
 * Initiates the ZITADEL login flow via PKCE redirect
 */
export async function loginWithZitadel(): Promise<void> {
  const manager = getUserManager();
  if (manager) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('musekit-auth-intent', 'login');
    }
    await manager.signinRedirect({
      extraQueryParams: { prompt: "login" }
    });
  }
}

/**
 * Initiates the ZITADEL registration flow via PKCE redirect
 */
export async function signupWithZitadel(): Promise<void> {
  const manager = getUserManager();
  if (manager) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('musekit-auth-intent', 'signup');
      localStorage.setItem('musekit-auth-intent', 'signup');
    }
    await manager.signinRedirect({
      extraQueryParams: { prompt: "create" },
      state: { intent: "signup" }
    });
  }
}


/**
 * Reads the stored auth intent ('login' | 'signup')
 */
export function getAuthIntent(): 'login' | 'signup' {
  if (typeof window === 'undefined') return 'login';
  const intent = sessionStorage.getItem('musekit-auth-intent') || localStorage.getItem('musekit-auth-intent');
  return intent === 'signup' ? 'signup' : 'login';
}

export function clearAuthIntent(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('musekit-auth-intent');
    localStorage.removeItem('musekit-auth-intent');
  }
}


/**
 * Handles application logout cleanly
 */
export async function logoutFromZitadel(): Promise<void> {
  try {
    const manager = getUserManager();
    if (manager) {
      await manager.removeUser().catch(() => {});
    }
  } catch (e) {
    console.warn("Error in removeUser:", e);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('music-auth');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('musekit-auth-intent');
      localStorage.removeItem('music-custom-playlists');

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('oidc.') || key.startsWith('music-auth'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (storageErr) {
      console.warn("Error clearing localStorage:", storageErr);
    }

    window.location.href = '/login';
  }
}

/**
 * Handles redirect callback after signup.
 * Syncs user to MongoDB via API Gateway, then clears tokens and session so user is NOT logged in.
 */
export async function handleSignupCallback(): Promise<boolean> {
  const manager = getUserManager();
  if (!manager) return false;

  let oidcUser: OidcUser | null = null;
  try {
    oidcUser = (await manager.signinCallback()) ?? null;
  } catch (err: any) {
    console.warn("Signup signinCallback error:", err);
    oidcUser = (await manager.getUser()) ?? null;
  }

  if (!oidcUser) return false;

  const isJwt = (t?: string | null) => Boolean(t && t.split('.').length === 3);
  const token = isJwt(oidcUser.id_token)
    ? oidcUser.id_token
    : (isJwt(oidcUser.access_token) ? oidcUser.access_token : (oidcUser.id_token || oidcUser.access_token));

  const fallbackUser: User = {
    id: oidcUser.profile.sub,
    email: oidcUser.profile.email || (oidcUser.profile.preferred_username as string) || 'user@musekit.com',
    name: oidcUser.profile.name || (oidcUser.profile.email ? oidcUser.profile.email.split('@')[0] : 'User')
  };

  // Sync with MongoDB backend via API Gateway
  try {
    await fetch(`${GATEWAY_URL}/api/users/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: fallbackUser.email,
        name: fallbackUser.name
      })
    });
  } catch (syncErr) {
    console.warn('Backend user sync failed during signup:', syncErr);
  }

  // Discard token & session so user is NOT logged in
  try {
    await manager.removeUser().catch(() => {});
  } catch (e) {}

  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('music-auth');
    localStorage.removeItem('music-player-store');
    clearAuthIntent();

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('oidc.') || key.startsWith('music-auth') || key.startsWith('music-player'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
  }

  return true;
}

/**
 * Handles redirect callback from ZITADEL for login.
 */
export async function handleAuthCallback(): Promise<User | null> {
  if (inFlightCallbackPromise) {
    return inFlightCallbackPromise;
  }

  inFlightCallbackPromise = (async (): Promise<User | null> => {
    const manager = getUserManager();
    if (!manager) return null;

    let oidcUser: OidcUser | null = null;
    try {
      oidcUser = (await manager.signinCallback()) ?? null;
    } catch (err: any) {
      console.warn("signinCallback error:", err);
      oidcUser = (await manager.getUser()) ?? null;
    }

    if (!oidcUser) return null;

    const isJwt = (t?: string | null) => Boolean(t && t.split('.').length === 3);
    const token = isJwt(oidcUser.id_token)
      ? oidcUser.id_token
      : (isJwt(oidcUser.access_token) ? oidcUser.access_token : (oidcUser.id_token || oidcUser.access_token));

    if (token) {
      localStorage.setItem('auth-token', token);
    }

    const fallbackUser: User = {
      id: oidcUser.profile.sub,
      email: oidcUser.profile.email || (oidcUser.profile.preferred_username as string) || 'user@musekit.com',
      name: oidcUser.profile.name || (oidcUser.profile.email ? oidcUser.profile.email.split('@')[0] : 'User')
    };

    try {
      const syncRes = await fetch(`${GATEWAY_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: fallbackUser.email,
          name: fallbackUser.name
        })
      });

      if (syncRes.ok) {
        const backendUser: User = await syncRes.json();
        localStorage.setItem('music-auth', JSON.stringify(backendUser));
        clearAuthIntent();
        return backendUser;
      }
    } catch (syncErr) {
      console.warn('Backend user sync failed, using fallback:', syncErr);
    }

    localStorage.setItem('music-auth', JSON.stringify(fallbackUser));
    clearAuthIntent();
    return fallbackUser;
  })();

  try {
    return await inFlightCallbackPromise;
  } finally {
    setTimeout(() => {
      inFlightCallbackPromise = null;
    }, 1000);
  }
}
