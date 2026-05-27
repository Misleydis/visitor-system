import { create } from 'zustand';

const useVisitorStore = create((set) => ({
  visitors: [],
  todayVisitors: [],
  returningVisitors: [],
  activityLogs: [],
  loading: false,
  error: null,

  setVisitors: (visitors) => set({ visitors }),
  setTodayVisitors: (visitors) => set({ todayVisitors: visitors }),
  setReturningVisitors: (visitors) => set({ returningVisitors: visitors }),
  setActivityLogs: (logs) => set({ activityLogs: logs }),
  setLoading: (status) => set({ loading: status }),
  setError: (error) => set({ error }),

  addVisitor: (visitor) => set((state) => ({
    todayVisitors: [...state.todayVisitors, visitor]
  })),

  updateVisitor: (id, updatedData) => set((state) => ({
    todayVisitors: state.todayVisitors.map(v =>
      v._id === id ? { ...v, ...updatedData } : v
    )
  })),

  removeVisitor: (id) => set((state) => ({
    todayVisitors: state.todayVisitors.filter(v => v._id !== id)
  }))
}));

export default useVisitorStore;
