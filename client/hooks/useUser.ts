import { useState, useEffect } from 'react';

export default function useUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    // placeholder: load user from localStorage/session
    const raw = null;
    if (raw) setUser(JSON.parse(raw));
  }, []);
  return { user, setUser };
}
