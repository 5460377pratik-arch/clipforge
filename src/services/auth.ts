import type { User, AuthSession, ApiResponse } from '../lib/types';
import { createClient as createBrowserClient, isSupabaseConfigured } from '../lib/supabase/client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthService {
  login(credentials: LoginCredentials): Promise<ApiResponse<AuthSession>>;
  signup(credentials: SignupCredentials): Promise<ApiResponse<AuthSession>>;
  forgotPassword(email: string): Promise<ApiResponse<{ sent: boolean }>>;
  logout(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
}

class SupabaseAuthService implements AuthService {
  private get NOT_CONFIGURED(): ApiErrorResponse {
    return {
      success: false as const,
      error: { code: 'AUTH_NOT_CONFIGURED', message: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.' }
    };
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthSession>> {
    if (!isSupabaseConfigured()) return this.NOT_CONFIGURED;
    
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { success: false, error: { code: 'AUTH_FAILED', message: error.message } };
    }

    if (!data.session || !data.user) {
      return { success: false, error: { code: 'AUTH_FAILED', message: 'Failed to establish session.' } };
    }

    return {
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || null,
          avatarUrl: data.user.user_metadata?.avatar_url || null,
          plan: 'free', // Default, would fetch from DB in a real app
          createdAt: data.user.created_at,
        },
        accessToken: data.session.access_token,
        expiresAt: data.session.expires_at || 0,
      }
    };
  }

  async signup(credentials: SignupCredentials): Promise<ApiResponse<AuthSession>> {
    if (!isSupabaseConfigured()) return this.NOT_CONFIGURED;
    
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
        }
      }
    });

    if (error) {
      return { success: false, error: { code: 'SIGNUP_FAILED', message: error.message } };
    }

    // If email confirmation is enabled, session might be null
    if (!data.session) {
      return { success: false, error: { code: 'CHECK_EMAIL', message: 'Please check your email to confirm your account.' } };
    }

    return {
      success: true,
      data: {
        user: {
          id: data.user!.id,
          email: data.user!.email!,
          name: credentials.name || null,
          avatarUrl: null,
          plan: 'free',
          createdAt: data.user!.created_at,
        },
        accessToken: data.session.access_token,
        expiresAt: data.session.expires_at || 0,
      }
    };
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ sent: boolean }>> {
    if (!isSupabaseConfigured()) return this.NOT_CONFIGURED;
    
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      return { success: false, error: { code: 'RESET_FAILED', message: error.message } };
    }
    
    return { success: true, data: { sent: true } };
  }

  async logout(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
  }

  async getSession(): Promise<AuthSession | null> {
    if (!isSupabaseConfigured()) return null;
    
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) return null;
    
    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name || null,
        avatarUrl: session.user.user_metadata?.avatar_url || null,
        plan: 'free',
        createdAt: session.user.created_at,
      },
      accessToken: session.access_token,
      expiresAt: session.expires_at || 0,
    };
  }
}

type ApiErrorResponse = { success: false; error: { code: string; message: string; field?: string } };

export const authService: AuthService = new SupabaseAuthService();