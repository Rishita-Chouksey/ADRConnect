import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/db';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Hospital Credentials',
      credentials: {
        employeeId: { label: 'Employee ID', type: 'text', placeholder: 'N-1001, AH-2001, AD-3001' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.employeeId) return null;

        try {
          const user = await db.user.findFirst({
            where: {
              OR: [
                { employeeId: credentials.employeeId.trim() },
                { email: credentials.employeeId.trim() },
              ],
            },
            include: { hospital: true },
          });

          if (user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              employeeId: user.employeeId,
              ward: user.ward,
              occupation: user.occupation,
              hospitalId: user.hospitalId,
              hospitalName: user.hospital?.name || 'District Hospital',
            } as any;
          }

          // Fallback for demo accounts if DB query failed
          if (credentials.employeeId === 'N-1001') {
            return {
              id: 'nurse-demo-id',
              name: 'Asha Verma',
              email: 'asha.verma@hospital.example',
              role: 'nurse',
              employeeId: 'N-1001',
              ward: 'Maternity Ward',
              occupation: 'Staff Nurse',
              hospitalName: 'District Maternal Hospital',
            } as any;
          }
          if (credentials.employeeId === 'AH-2001') {
            return {
              id: 'adrhead-demo-id',
              name: 'Dr. Priya Nair',
              email: 'priya.nair@hospital.example',
              role: 'adr_head',
              employeeId: 'AH-2001',
              ward: 'Pharmacovigilance Center',
              occupation: 'Pharmacovigilance Officer',
              hospitalName: 'District Maternal Hospital',
            } as any;
          }
          if (credentials.employeeId === 'AD-3001') {
            return {
              id: 'admin-demo-id',
              name: 'IT Admin',
              email: 'admin@hospital.example',
              role: 'admin',
              employeeId: 'AD-3001',
              ward: 'Central Pharmacy / IT',
              occupation: 'Hospital Pharmacy Administrator',
              hospitalName: 'District Maternal Hospital',
            } as any;
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.employeeId = (user as any).employeeId;
        token.ward = (user as any).ward;
        token.occupation = (user as any).occupation;
        token.hospitalId = (user as any).hospitalId;
        token.hospitalName = (user as any).hospitalName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).employeeId = token.employeeId;
        (session.user as any).ward = token.ward;
        (session.user as any).occupation = token.occupation;
        (session.user as any).hospitalId = token.hospitalId;
        (session.user as any).hospitalName = token.hospitalName;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'adrconnect_secret_key_2026',
};
