import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Aero Store',
  description: 'Create a free Aero Store account to discover incredible apps.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
