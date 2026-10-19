import React from 'react';
import AuthPanel from '@/components/AuthPanel';

export const metadata = {
  title: 'Explorer Sign In | Aanandham.go',
  description: 'Explorer sign in for Aanandham.go Wilderness Basecamps.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function LoginPage() {
  return <AuthPanel initialMode="login" />;
}
