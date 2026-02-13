import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetMyLabourProfile } from './hooks/useQueries';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SelectRoleScreen from './screens/SelectRoleScreen';
import LabourProfileSetupScreen from './screens/LabourProfileSetupScreen';
import LabourHomeScreen from './screens/LabourHomeScreen';
import LabourEditProfileScreen from './screens/LabourEditProfileScreen';
import CustomerHomeScreen from './screens/CustomerHomeScreen';
import { Toaster } from '@/components/ui/sonner';
import { UserRole } from './backend';

type Screen = 
  | 'splash' 
  | 'login' 
  | 'selectRole' 
  | 'labourProfileSetup' 
  | 'labourHome' 
  | 'labourEditProfile'
  | 'customerHome';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: labourProfile, isLoading: labourLoading, isFetched: labourFetched } = useGetMyLabourProfile();

  const isAuthenticated = !!identity;

  useEffect(() => {
    // Auto-navigate from splash after 2 seconds
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  useEffect(() => {
    // Auth-aware routing logic
    if (isInitializing || currentScreen === 'splash') {
      return;
    }

    if (!isAuthenticated) {
      if (currentScreen !== 'login') {
        setCurrentScreen('login');
      }
      return;
    }

    // User is authenticated
    if (profileLoading || !profileFetched) {
      return;
    }

    // No role selected yet
    if (!userProfile) {
      if (currentScreen !== 'selectRole') {
        setCurrentScreen('selectRole');
      }
      return;
    }

    // User has a role
    if (userProfile.role === UserRole.labour) {
      // Labour flow
      if (labourLoading || !labourFetched) {
        return;
      }

      // Check if labour profile is complete
      const hasCompleteProfile = labourProfile && 
        labourProfile.name && 
        labourProfile.skill && 
        labourProfile.area &&
        labourProfile.wage > 0n;

      if (!hasCompleteProfile) {
        if (currentScreen !== 'labourProfileSetup') {
          setCurrentScreen('labourProfileSetup');
        }
      } else {
        if (currentScreen === 'login' || currentScreen === 'selectRole' || currentScreen === 'labourProfileSetup') {
          setCurrentScreen('labourHome');
        }
      }
    } else if (userProfile.role === UserRole.customer) {
      // Customer flow
      if (currentScreen === 'login' || currentScreen === 'selectRole') {
        setCurrentScreen('customerHome');
      }
    }
  }, [isAuthenticated, isInitializing, userProfile, profileLoading, profileFetched, labourProfile, labourLoading, labourFetched, currentScreen]);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 'splash' && <SplashScreen />}
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'selectRole' && <SelectRoleScreen onNavigate={handleNavigate} />}
      {currentScreen === 'labourProfileSetup' && <LabourProfileSetupScreen onNavigate={handleNavigate} />}
      {currentScreen === 'labourHome' && <LabourHomeScreen onNavigate={handleNavigate} />}
      {currentScreen === 'labourEditProfile' && <LabourEditProfileScreen onNavigate={handleNavigate} />}
      {currentScreen === 'customerHome' && <CustomerHomeScreen onNavigate={handleNavigate} />}
      <Toaster />
    </div>
  );
}

export default App;
