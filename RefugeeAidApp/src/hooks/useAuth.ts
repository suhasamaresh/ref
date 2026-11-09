import { useAuth as useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useAuthContext();
  
  return {
    // State
    user: context.user,
    token: context.token,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    isInitialized: context.isInitialized,
    
    // Actions
    login: context.login,
    register: context.register,
    logout: context.logout,
    updateUser: context.updateUser,
    refreshToken: context.refreshToken,
  };
};
