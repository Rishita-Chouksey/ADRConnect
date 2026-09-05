'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, DemoUser, DEMO_ACCOUNTS } from './types';
import { useRouter, usePathname } from 'next/navigation';

interface RoleContextType {
  currentUser: DemoUser;
  switchRole: (role: UserRole) => void;
  activeRole: UserRole;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<DemoUser>(DEMO_ACCOUNTS[0]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedRole = localStorage.getItem('adrconnect_role') as UserRole | null;
    if (savedRole) {
      const match = DEMO_ACCOUNTS.find((u) => u.role === savedRole);
      if (match) setCurrentUser(match);
    }
  }, []);

  const switchRole = (role: UserRole) => {
    const match = DEMO_ACCOUNTS.find((u) => u.role === role);
    if (match) {
      setCurrentUser(match);
      localStorage.setItem('adrconnect_role', role);

      // Route to relevant portal
      if (role === 'nurse' && !pathname.startsWith('/nurse')) {
        router.push('/nurse');
      } else if (role === 'adr_head' && !pathname.startsWith('/adr-head')) {
        router.push('/adr-head');
      } else if (role === 'admin' && !pathname.startsWith('/admin')) {
        router.push('/admin');
      }
    }
  };

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        switchRole,
        activeRole: currentUser.role,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
