import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Aero Store',
  description: 'Log in to your Aero Store account to download verified apps.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
