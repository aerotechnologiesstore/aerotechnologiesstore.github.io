import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'App Details - Aero Store',
  description: 'View app details, ratings, and download verified software.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
