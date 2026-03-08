import { useCallback, useEffect, useState } from 'react';

import * as SecureStore from 'expo-secure-store';

const STORE_KEY = 'watched_folder_ids';

const load = async (): Promise<Set<string>> => {
  const raw = await SecureStore.getItemAsync(STORE_KEY);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
};

const save = async (ids: Set<string>): Promise<void> => {
  await SecureStore.setItemAsync(STORE_KEY, JSON.stringify([...ids]));
};

export const useWatchedFolders = () => {
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    load().then(setWatchedIds);
  }, []);

  const isWatched = useCallback((albumId: string): boolean => {
    return watchedIds.has(albumId);
  }, [watchedIds]);

  const addFolder = useCallback(async (albumId: string): Promise<void> => {
    setWatchedIds((prev) => {
      const next = new Set(prev);
      next.add(albumId);
      save(next);
      return next;
    });
  }, []);

  const removeFolder = useCallback(async (albumId: string): Promise<void> => {
    setWatchedIds((prev) => {
      const next = new Set(prev);
      next.delete(albumId);
      save(next);
      return next;
    });
  }, []);

  return { isWatched, addFolder, removeFolder };
};
