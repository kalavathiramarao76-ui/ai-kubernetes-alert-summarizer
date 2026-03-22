'use client';
import { useState, useEffect } from 'react';
import { auth, signInWithGoogle, signOut, onAuthStateChanged, User } from '@/lib/firebase';
import { needsAuth, getUsageCount } from '@/lib/usage';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user && needsAuth()) {
      setShowAuth(true);
    }
  }, [user]);

  if (loading) return null;

  if (showAuth && !user) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h2 className="text-2xl font-bold text-white mb-2">Free trial complete</h2>
          <p className="text-zinc-400 mb-6">You&apos;ve used {getUsageCount()} of 5 free generations. Sign in with Google to continue — it&apos;s free.</p>
          <button
            onClick={async () => {
              try {
                await signInWithGoogle();
                setShowAuth(false);
              } catch (e) { console.error(e); }
            }}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-zinc-900 font-semibold hover:bg-zinc-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <p className="text-xs text-zinc-500 mt-4 text-center">We only use your email for account access. No spam.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);
  
  if (!user) return null;
  
  return (
    <div className="flex items-center gap-2">
      <img src={user.photoURL || ''} alt="" className="w-7 h-7 rounded-full" />
      <span className="text-xs text-zinc-400 hidden sm:inline">{user.displayName?.split(' ')[0]}</span>
      <button onClick={() => signOut(auth)} className="text-xs text-zinc-500 hover:text-zinc-300">Sign out</button>
    </div>
  );
}
