import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { ListRenderItemInfo } from '@shopify/flash-list';

import * as MediaLibrary from 'expo-media-library';
import { Header } from '@/components/header';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PADDING = 10;
const NUM_COLUMNS = 2;
const ITEM_SIZE = (SCREEN_WIDTH - PADDING * 2) / NUM_COLUMNS;

const PHOTO_COLUMNS = 3;
const PHOTO_SIZE = SCREEN_WIDTH / PHOTO_COLUMNS;

const HEADER_EXPANDED = SCREEN_HEIGHT * 0.4;
const HEADER_COLLAPSED = SCREEN_HEIGHT * 0.1;
const COLLAPSE_SCROLL = 120;

type FoldersTabProps = {
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

type FolderDetailProps = {
  album: MediaLibrary.Album;
  onBack: () => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const FolderCover = ({ albumId }: { albumId: string }) => {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    MediaLibrary.getAssetsAsync({
      album: albumId,
      first: 1,
      mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
    })
      .then(({ assets }) => {
        if (assets[0]) setUri(assets[0].uri);
      })
      .catch(() => {});
  }, [albumId]);

  if (!uri) {
    return (
      <View className="absolute inset-0 items-center justify-center bg-glass">
        <Text className="text-4xl">📁</Text>
      </View>
    );
  }

  return <Image source={{ uri }} className="absolute inset-0" resizeMode="cover" />;
};

const renderFolderPhoto = ({ item }: ListRenderItemInfo<MediaLibrary.Asset>) => (
  <View style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }} className="p-px">
    <Image source={{ uri: item.uri }} className="flex-1" resizeMode="cover" />
  </View>
);

const FolderDetail = ({ album, onBack, onScroll }: FolderDetailProps) => {
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    MediaLibrary.getAssetsAsync({
      album: album.id,
      mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      first: 300,
    })
      .then(({ assets }) => {
        setPhotos(assets);
        if (assets.length > 0) setCoverUri(assets[0].uri);
      })
      .catch((err) => console.error('Failed to load folder photos:', err))
      .finally(() => setIsLoading(false));
  }, [album.id]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, COLLAPSE_SCROLL],
    outputRange: [HEADER_EXPANDED, HEADER_COLLAPSED],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false, listener: onScroll },
  );

  return (
    <View className="flex-1">
      <Animated.View style={{ height: headerHeight }} className="overflow-hidden">
        {coverUri && (
          <Image source={{ uri: coverUri }} className="absolute inset-0" resizeMode="cover" />
        )}
        <View className="absolute inset-0 bg-black/50" />
        <View className="flex-1 flex-row items-center justify-between px-4">
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            className="flex-row items-center gap-2 flex-shrink"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color="white" />
            <Text className="text-white font-bold text-2xl" numberOfLines={1}>
              {album.title}
            </Text>
          </TouchableOpacity>
          <Switch
            value={syncEnabled}
            onValueChange={setSyncEnabled}
            trackColor={{ false: '#3f3f46', true: '#a855f7' }}
            thumbColor="#ffffff"
          />
        </View>
      </Animated.View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#a855f7" size="large" />
        </View>
      ) : photos.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground/40 text-[15px]">No photos in this folder</Text>
        </View>
      ) : (
        <FlashList
          data={photos}
          numColumns={PHOTO_COLUMNS}
          keyExtractor={(item) => item.id}
          renderItem={renderFolderPhoto}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}
    </View>
  );
};

export const FoldersTab = ({ onScroll }: FoldersTabProps) => {
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<MediaLibrary.Album | null>(null);

  useEffect(() => {
    MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true })
      .then((all) => setAlbums(all.filter((a) => a.assetCount > 0)))
      .catch((err) => console.error('Failed to load albums:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const renderAlbum = useCallback(({ item }: ListRenderItemInfo<MediaLibrary.Album>) => (
    <TouchableOpacity
      activeOpacity={0.85}
      className="flex-1 rounded-xl overflow-hidden bg-glass m-1"
      style={{ height: ITEM_SIZE }}
      onPress={() => setSelectedAlbum(item)}
    >
      <FolderCover albumId={item.id} />
      <View className="absolute bottom-0 left-0 right-0 px-[10px] py-2 bg-background/50">
        <Text className="text-foreground font-semibold text-[13px]" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-foreground/55 text-[11px] mt-px">{item.assetCount}</Text>
      </View>
    </TouchableOpacity>
  ), []);

  if (selectedAlbum) {
    return (
      <FolderDetail
        album={selectedAlbum}
        onBack={() => setSelectedAlbum(null)}
        onScroll={onScroll}
      />
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#a855f7" size="large" />
      </View>
    );
  }

  if (albums.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-white/40 text-[15px]">No folders found</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-col h-full">
      <Header title="Folders" />
      <FlashList
        data={albums}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item.id}
        renderItem={renderAlbum}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};
