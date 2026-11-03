import React from 'react';
import { AuthPage } from '../../components/auth/AuthPage';

export const ForgotPasswordPage: React.FC = () => {
  return <AuthPage defaultMode="forgot" />;
};
