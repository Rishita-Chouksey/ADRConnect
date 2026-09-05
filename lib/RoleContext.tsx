'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, DemoUser, DEMO_ACCOUNTS } from './types';
import { useSession, signOut } from 'next-auth/react';

interface RoleContextType {
  currentUser: DemoUser;
  activeRole: UserRole;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const [currentUser, setCurrentUser] = useState<DemoUser>(DEMO_ACCOUNTS[0]);

  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      setCurrentUser({
        id: u.id || 'user-id',
        name: u.name || 'Hospital User',
        email: u.email || '',
        role: (u.role as UserRole) || 'nurse',
        employeeId: u.employeeId || 'N-1001',
        ward: u.ward || 'General Ward',
        occupation: u.occupation || 'Staff',
      });
    }
  }, [session]);

  const logout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        activeRole: currentUser.role,
        logout,
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
