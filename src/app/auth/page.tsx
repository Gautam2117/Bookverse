// src/app/auth/page.tsx      (server component)
import AuthShell from './AuthShell'

export const metadata = { title: 'Sign in – BookVerse' }

/**
 * No server-side logic yet — just render the client shell.
 * Later you can inject CSRF tokens, auth providers, etc.
 */
export default function AuthPage() {
  return <AuthShell />
}
