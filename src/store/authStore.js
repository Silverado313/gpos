import { create } from 'zustand'

const useAuthStore = create((set) => ({
    user: null,
    role: null,
    loading: true,
    setUser: (user) => set({ user }),
    setRole: (role) => set({ role }),
    setLoading: (loading) => set({ loading }),
}))

export default useAuthStore