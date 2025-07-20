/**
 * Simple auth store for managing authentication state
 */

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
}

class AuthStore {
  private state: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
  };

  private listeners: Set<() => void> = new Set();

  getState(): AuthState {
    return { ...this.state };
  }

  setToken(token: string | null) {
    this.state.token = token;
    this.state.isAuthenticated = !!token;
    this.notify();
  }

  setUser(user: any | null) {
    this.state.user = user;
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  clear() {
    this.state = {
      token: null,
      user: null,
      isAuthenticated: false,
    };
    this.notify();
  }
}

export const useAuthStore = new AuthStore();