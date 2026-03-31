import { useState, useEffect } from 'react';
import pb from '../api/pocketbase';

const createUsernameFromEmail = (email) => {
  const localPart = (email || '').split('@')[0] || 'user';
  const safe = localPart.toLowerCase().replace(/[^a-z0-9._-]/g, '');
  const base = (safe || 'user').slice(0, 20);
  const suffix = Date.now().toString().slice(-4);
  return `${base}_${suffix}`;
};

const formatPbError = (err, fallbackMessage) => {
  const data = err?.response?.data;
  if (data && typeof data === 'object') {
    const messages = Object.values(data)
      .map((fieldError) => fieldError?.message)
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join('\n');
    }
  }

  if (err?.message && err.message !== 'Failed to create record.') {
    return err.message;
  }

  return fallbackMessage;
};

const createUserWithFallbackPayloads = async ({ name, email, password }) => {
  const username = createUsernameFromEmail(email);
  const trimmedName = name?.trim() || username;
  const payloads = [
    {
      username,
      name: trimmedName,
      email,
      emailVisibility: true,
      password,
      passwordConfirm: password,
    },
    {
      username,
      email,
      password,
      passwordConfirm: password,
    },
    {
      email,
      password,
      passwordConfirm: password,
    },
  ];

  let lastError;
  for (const payload of payloads) {
    try {
      return await pb.collection('users').create(payload);
    } catch (err) {
      lastError = err;
      if (err?.status !== 400) {
        break;
      }
    }
  }

  throw lastError;
};

export const useAuth = () => {
  const [user, setUser] = useState(pb.authStore.model);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
      setLoading(false);
    });
    setUser(pb.authStore.model);
    setLoading(false);
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      return authData;
    } catch (err) {
      throw new Error(formatPbError(err, 'Login failed'));
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      await createUserWithFallbackPayloads({ name, email, password });
      const authData = await pb.collection('users').authWithPassword(email, password);
      return authData;
    } catch (err) {
      throw new Error(
        formatPbError(
          err,
          'Registration failed. Please check your inputs or contact support if registration is disabled.'
        )
      );
    }
  };

  const logout = () => pb.authStore.clear();

  return { user, loading, login, register, logout };
};