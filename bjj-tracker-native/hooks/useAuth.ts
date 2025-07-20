import { useState } from 'react';

// Dummy user object for local mode
const LOCAL_USER = { id: 'local', email: 'local@user' };

export function useAuth() {
  // Always signed in as local user
  return {
    user: LOCAL_USER,
    loading: false,
    signInWithGoogle: () => {},
    signOut: () => {},
  };
} 