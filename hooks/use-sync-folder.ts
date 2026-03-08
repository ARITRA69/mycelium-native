import { useRef, useState } from 'react';

import * as MediaLibrary from 'expo-media-library';

import { env } from '@/constants/env';

type SyncStateIdle = { status: 'idle' };
type SyncStateSyncing = { status: 'syncing'; current: number; total: number; currentFilename: string };
type SyncStateDone = { status: 'done'; uploaded: number; skipped: number; failed: number };
type SyncStateError = { status: 'error'; message: string };

type SyncState = SyncStateIdle | SyncStateSyncing | SyncStateDone | SyncStateError;

const ASSETS_PAGE_SIZE = 100;

const fetchSyncedIds = async (): Promise<Set<string>> => {
  const res = await fetch(`${env.apiUrl}/media/synced-asset-ids`);
  if (!res.ok) throw new Error(`Failed to fetch synced IDs: ${res.status}`);
  const json = await res.json() as { data: { ids: string[] } };
  return new Set(json.data.ids);
};

const collectAllAssets = async (album: MediaLibrary.Album): Promise<MediaLibrary.Asset[]> => {
  const assets: MediaLibrary.Asset[] = [];
  let cursor: string | undefined;

  while (true) {
    const page = await MediaLibrary.getAssetsAsync({
      album: album.id,
      first: ASSETS_PAGE_SIZE,
      after: cursor,
      mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
    });

    assets.push(...page.assets);

    if (!page.hasNextPage) break;
    cursor = page.endCursor;
  }

  return assets;
};

export const useSyncFolder = () => {
  const [state, setState] = useState<SyncState>({ status: 'idle' });
  const cancelledRef = useRef(false);

  const cancelSync = () => {
    cancelledRef.current = true;
    setState({ status: 'idle' });
  };

  const startSync = async (album: MediaLibrary.Album): Promise<void> => {
    cancelledRef.current = false;

    try {
      const syncedIds = await fetchSyncedIds();
      const allAssets = await collectAllAssets(album);
      const pending = allAssets.filter((a) => !syncedIds.has(a.id));

      let uploaded = 0;
      const skipped = allAssets.length - pending.length;
      let failed = 0;

      setState({
        status: 'syncing',
        current: 0,
        total: pending.length,
        currentFilename: '',
      });

      for (let i = 0; i < pending.length; i++) {
        if (cancelledRef.current) return;

        const asset = pending[i];
        setState({
          status: 'syncing',
          current: i + 1,
          total: pending.length,
          currentFilename: asset.filename,
        });

        try {
          const info = await MediaLibrary.getAssetInfoAsync(asset);
          const localUri = info.localUri;
          if (!localUri) {
            failed++;
            continue;
          }

          const ext = asset.filename.split('.').pop()?.toLowerCase() ?? '';
          let mimeType: string;
          if (asset.mediaType === MediaLibrary.MediaType.video) {
            mimeType = ext === 'mov' ? 'video/quicktime' : 'video/mp4';
          } else {
            switch (ext) {
              case 'jpg':
              case 'jpeg': mimeType = 'image/jpeg'; break;
              case 'png':  mimeType = 'image/png';  break;
              case 'heic': mimeType = 'image/heic'; break;
              case 'webp': mimeType = 'image/webp'; break;
              default:     mimeType = 'image/jpeg'; break;
            }
          }

          // Extract EXIF metadata — iOS nests under '{Exif}'/'{TIFF}', Android uses flat keys
          const exif = info.exif as Record<string, unknown> | undefined;
          const exifSub = (exif?.['{Exif}'] ?? exif ?? {}) as Record<string, unknown>;
          const tiff = (exif?.['{TIFF}'] ?? exif ?? {}) as Record<string, unknown>;

          const aperture = (exifSub['FNumber'] ?? null) as number | null;
          const isoRaw = exifSub['ISOSpeedRatings'];
          const iso = (Array.isArray(isoRaw) ? isoRaw[0] : isoRaw ?? null) as number | null;
          const shutterSpeed = (exifSub['ExposureTime'] ?? null) as number | null;
          const focalLength = (exifSub['FocalLength'] ?? null) as number | null;
          const deviceMake = (tiff['Make'] ?? null) as string | null;
          const deviceModel = (tiff['Model'] ?? null) as string | null;

          const form = new FormData();
          form.append('file', { uri: localUri, type: mimeType, name: asset.filename } as unknown as Blob);
          form.append('device_asset_id', asset.id);
          if (aperture != null) form.append('aperture', String(aperture));
          if (iso != null) form.append('iso', String(iso));
          if (shutterSpeed != null) form.append('shutter_speed', String(shutterSpeed));
          if (focalLength != null) form.append('focal_length', String(focalLength));
          if (deviceMake != null) form.append('device_make', deviceMake);
          if (deviceModel != null) form.append('device_model', deviceModel);

          const uploadRes = await fetch(`${env.apiUrl}/media/upload`, {
            method: 'POST',
            body: form,
          });

          if (uploadRes.ok) {
            uploaded++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }

      if (!cancelledRef.current) {
        setState({ status: 'done', uploaded, skipped, failed });
      }
    } catch (err) {
      if (!cancelledRef.current) {
        const message = err instanceof Error ? err.message : 'Sync failed';
        setState({ status: 'error', message });
      }
    }
  };

  return { state, startSync, cancelSync };
};
