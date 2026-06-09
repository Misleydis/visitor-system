import { create } from 'zustand';

const useUserStore = create((set) => ({
  users: [],
  pendingUsers: [],
  loading: false,
  error: null,

  setUsers: (users) => set({ users }),
  setPendingUsers: (users) => set({ pendingUsers: users }),
  setLoading: (status) => set({ loading: status }),
  setError: (error) => set({ error }),

  addUser: (user) => set((state) => ({
    users: [...state.users, user]
  })),

  updateUser: (id, updatedData) => set((state) => ({
    users: state.users.map(u =>
      u._id === id ? { ...u, ...updatedData } : u
    ),
    pendingUsers: state.pendingUsers.map(u =>
      u._id === id ? { ...u, ...updatedData } : u
    )
  })),

  removeUser: (id) => set((state) => ({
    users: state.users.filter(u => u._id !== id),
    pendingUsers: state.pendingUsers.filter(u => u._id !== id)
  }))
}));

export default useUserStore;
