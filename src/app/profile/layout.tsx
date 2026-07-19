import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile - Aero Store',
  description: 'Manage your Aero Store account.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
