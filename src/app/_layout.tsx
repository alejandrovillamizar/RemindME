import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/auth-context';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={DarkTheme}>
        <AppTabs />
      </ThemeProvider>
    </AuthProvider>
  );
}
