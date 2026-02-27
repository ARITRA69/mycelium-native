import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Text, View } from 'react-native';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { FlashList } from '@shopify/flash-list';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as MediaLibrary from 'expo-media-library';

import { Header } from '@/components/header';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MIN_COLUMNS = 3;
const MAX_COLUMNS = 8;
// How far scale must deviate from the last-snapped baseline to trigger a column change
const PINCH_STEP = 0.3;

const getItemSize = (columns: number) => SCREEN_WIDTH / columns;

const renderPhoto = (columns: number) =>
  ({ item }: ListRenderItemInfo<MediaLibrary.Asset>) => {
    const size = getItemSize(columns);
    return (
      <View style={{ width: size, height: size }} className="p-px">
        <Image source={{ uri: item.uri }} className="flex-1" resizeMode="cover" />
      </View>
    );
  };

export const PhotosTab = () => {
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [columns, setColumns] = useState(3);

  // Baseline scale at the start of each gesture (or after each column snap)
  const baselineScale = useRef(1);

  useEffect(() => {
    const loadCameraPhotos = async () => {
      try {
        const albums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });

        // iOS uses "Camera Roll" smart album; Android uses "Camera"
        const cameraAlbum = albums.find(
          (a) => a.title === 'Camera Roll' || a.title === 'Camera',
        );

        const { assets } = await MediaLibrary.getAssetsAsync({
          album: cameraAlbum ?? undefined,
          mediaType: [MediaLibrary.MediaType.photo],
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
          first: 300,
        });

        setPhotos(assets);
      } catch (err) {
        console.error('Failed to load camera photos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCameraPhotos();
  }, []);

  const pinchGesture = Gesture.Pinch()
    .runOnJS(true)
    .onStart(() => {
      baselineScale.current = 1;
    })
    .onUpdate((e) => {
      const delta = e.scale - baselineScale.current;

      if (delta > PINCH_STEP) {
        // Pinch out → more columns
        setColumns((prev) => Math.min(prev + 1, MAX_COLUMNS));
        baselineScale.current = e.scale;
      } else if (delta < -PINCH_STEP) {
        // Pinch in → fewer columns
        setColumns((prev) => Math.max(prev - 1, MIN_COLUMNS));
        baselineScale.current = e.scale;
      }
    });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#a855f7" size="large" />
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-foreground/40 text-[15px]">No camera photos found</Text>
      </View>
    );
  }

  return (
    <GestureDetector gesture={pinchGesture}>
      <View className="flex-1">
        <Header title="Photos" />
        <FlashList
          key={columns}
          data={photos}
          numColumns={columns}
          keyExtractor={(item) => item.id}
          renderItem={renderPhoto(columns)}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </GestureDetector>
  );
};
