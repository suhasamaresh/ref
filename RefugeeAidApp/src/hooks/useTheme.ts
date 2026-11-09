import { useTheme as useThemeContext } from '../context/ThemeContext';

export const useTheme = () => {
  const context = useThemeContext();
  
  return {
    ...context,
    // Additional theme utilities can be added here
  };
};
