'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';
import { createClient } from '@/lib/supabase/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      dispatch(setUser(user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      dispatch(setUser(session?.user ?? null));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, supabase]);

  return <>{children}</>;
}
