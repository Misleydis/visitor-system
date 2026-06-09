import { useState, useEffect } from 'react';
import {
  registerVisitor,
  getVisitorByTicket,
  recordTimeOut,
  cancelVisitor,
  editVisitor,
  getTodayVisitors,
  getAllVisitors,
  getReturningVisitors,
  deleteVisitor,
  getActivityLogs,
} from '../services/api';

/**
 * Custom hook for visitor operations
 */
export const useVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [todayVisitors, setTodayVisitors] = useState([]);
  const [returningVisitors, setReturningVisitors] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodayVisitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTodayVisitors();
      setTodayVisitors(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch visitors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVisitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllVisitors();
      setVisitors(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch visitors');
    } finally {
      setLoading(false);
    }
  };

  const fetchReturningVisitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getReturningVisitors();
      setReturningVisitors(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch returning visitors');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getActivityLogs();
      setActivityLogs(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const addVisitor = async (visitorData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerVisitor(visitorData);
      await fetchTodayVisitors();
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add visitor');
      return { success: false, error: err.response?.data?.msg };
    } finally {
      setLoading(false);
    }
  };

  const checkoutVisitor = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await recordTimeOut(id);
      await fetchTodayVisitors();
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to checkout visitor');
      return { success: false, error: err.response?.data?.msg };
    } finally {
      setLoading(false);
    }
  };

  const cancelVisit = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await cancelVisitor(id);
      await fetchTodayVisitors();
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to cancel visit');
      return { success: false, error: err.response?.data?.msg };
    } finally {
      setLoading(false);
    }
  };

  const updateVisitor = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      await editVisitor(id, data);
      await fetchTodayVisitors();
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update visitor');
      return { success: false, error: err.response?.data?.msg };
    } finally {
      setLoading(false);
    }
  };

  const removeVisitor = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteVisitor(id);
      await fetchTodayVisitors();
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete visitor');
      return { success: false, error: err.response?.data?.msg };
    } finally {
      setLoading(false);
    }
  };

  const searchByTicket = async (ticketNumber) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getVisitorByTicket(ticketNumber);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.msg || 'Visitor not found');
      return { success: false, error: err.response?.data?.msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    visitors,
    todayVisitors,
    returningVisitors,
    activityLogs,
    loading,
    error,
    fetchTodayVisitors,
    fetchAllVisitors,
    fetchReturningVisitors,
    fetchActivityLogs,
    addVisitor,
    checkoutVisitor,
    cancelVisit,
    updateVisitor,
    removeVisitor,
    searchByTicket,
  };
};
