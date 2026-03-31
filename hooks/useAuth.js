import { useState, useEffect } from 'react';
import pb from '../api/pocketbase';

const CLIENT_ROLE_ID = 'jnbnkhrw07fksyk';

const formatPbError = (err, fallbackMessage) => {
  const status = err?.status ?? err?.response?.status;
  const topMessage = err?.response?.message || err?.message;

  if (
    status === 400 &&
    topMessage &&
    topMessage.toLowerCase().includes('something went wrong while processing your request')
  ) {
    return 'Registration is blocked by backend configuration. Check users create rule, ensure public signup is allowed, and verify a roles record for client exists.';
  }

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

const createUser = async ({ name, email, password }) => {
  return pb.collection('users').create({
    display_name: name?.trim() || email,
    email,
    emailVisibility: true,
    role_id: CLIENT_ROLE_ID,
    password,
    passwordConfirm: password,
  });
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
      await createUser({ name, email, password });
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