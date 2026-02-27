import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { ListRenderItemInfo } from '@shopify/flash-list';

import * as MediaLibrary from 'expo-media-library';
import { Header } from '@/components/header';

const PADDING = 10;
const NUM_COLUMNS = 2;
// Square items: width = (screen - horizontal padding on both sides) / columns
const ITEM_SIZE = (Dimensions.get('window').width - PADDING * 2) / NUM_COLUMNS;

type FoldersTabProps = {
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
      .catch(() => { });
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

const renderAlbum = ({ item }: ListRenderItemInfo<MediaLibrary.Album>) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="flex-1 rounded-xl overflow-hidden bg-glass m-1"
      style={{ height: ITEM_SIZE }}
    >
      <FolderCover albumId={item.id} />
      <View className="absolute bottom-0 left-0 right-0 px-[10px] py-2 bg-background/50">
        <Text className="text-foreground font-semibold text-[13px]" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-foreground/55 text-[11px] mt-px">{item.assetCount}</Text>
      </View>
    </TouchableOpacity>
  )
};

export const FoldersTab = ({ onScroll }: FoldersTabProps) => {
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true })
      .then((all) => setAlbums(all.filter((a) => a.assetCount > 0)))
      .catch((err) => console.error('Failed to load albums:', err))
      .finally(() => setIsLoading(false));
  }, []);

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
    <View className='flex flex-col h-full'>
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
