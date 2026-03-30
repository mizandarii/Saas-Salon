import { useState, useEffect } from 'react';
import pb from '../api/pocketbase';

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
      throw err;
    }
  };

  const logout = () => pb.authStore.clear();

  return { user, loading, login, logout };
};