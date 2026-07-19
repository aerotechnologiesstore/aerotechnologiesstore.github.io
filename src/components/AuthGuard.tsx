"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthGuard({ children, requireRole }: { children: React.ReactNode; requireRole?: 'user' | 'developer' | 'admin' }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in -> Redirect to login
        router.replace("/login");
      } else if (requireRole && userData && userData.role !== requireRole && userData.role !== 'admin') {
        // Needs a specific role, but user doesn't have it (admin overrides)
        if (requireRole === 'developer') {
          router.replace("/register/developer");
        } else {
          router.replace("/");
        }
      }
    }
  }, [user, userData, loading, router, pathname, requireRole]);

  if (loading || !user) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--c2)', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  if (requireRole && userData && userData.role !== requireRole && userData.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
