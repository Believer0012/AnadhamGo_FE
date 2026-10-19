import React from 'react';
import AuthPanel from '@/components/AuthPanel';

export const metadata = {
  title: 'Join Wilderness Tribe | Aanandham.go',
  description: 'Create your Aanandham.go explorer account.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function SignupPage() {
  return <AuthPanel initialMode="signup" />;
}
