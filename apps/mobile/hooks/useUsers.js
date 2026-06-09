import { useState } from 'react';
import {
  getUsers,
  getPendingUsers,
  approveUser,
  createUser,
  deleteUser,
} from '../services/api';

/**
 * Custom hook for user management (admin)
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPendingUsers();
      setPendingUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id, role) => {
    setLoading(true);
    setError(null);
    try {
      await approveUser(id, role);
      await fetchPendingUsers();
      await fetchUsers();
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to approve user');
      return { success: false, error: err.response?.data?.msg };
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      await createUser(userData);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create user');
      return { success: false, error: err.response?.data?.msg };
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteUser(id);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete user');
      return { success: false, error: err.response?.data?.msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    pendingUsers,
    loading,
    error,
    fetchUsers,
    fetchPendingUsers,
    approve,
    addUser,
    removeUser,
  };
};
