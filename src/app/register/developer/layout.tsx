import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer Registration - Aero Store',
  description: 'Register as a verified developer to publish apps to millions of users.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
