import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support & Tickets - Aero Store',
  description: 'Get help and manage support tickets.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
