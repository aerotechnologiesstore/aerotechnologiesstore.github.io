import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use - Aero Store',
  description: 'Aero Store Terms and Conditions.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
