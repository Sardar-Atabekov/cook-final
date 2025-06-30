import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

function getUserFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem('recipe-finder-storage');
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed.state?.user || null;
  } catch {
    return null;
  }
}

export function usePersistedUser() {
  const storeUser = useStore((state) => state.user);
  const isHydrated = useStore.persist.hasHydrated();
  const [initialUser, setInitialUser] = useState(() => getUserFromStorage());

  useEffect(() => {
    if (isHydrated) setInitialUser(null);
  }, [isHydrated]);

  return storeUser || initialUser;
}
