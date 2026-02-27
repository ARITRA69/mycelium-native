import { ReactNode, useRef, useState } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent, Text, TouchableOpacity } from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlbumsTab } from '@/screens/tabs/albums';
import { FoldersTab } from '@/screens/tabs/folders';
import { PhotosTab } from '@/screens/tabs/photos';
import { cn } from '@/lib/utils';
import { ComputerPhoneSyncIcon, Folder01Icon, FoldersIcon, Image01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';

type Tab = 'folders' | 'photos' | 'albums';

const TABS: { key: Tab; label: string, icon: ReactNode }[] = [
  { key: 'photos', label: 'Photos', icon: <HugeiconsIcon icon={Image01Icon} /> },
  { key: 'albums', label: 'Albums', icon: <HugeiconsIcon icon={Folder01Icon} /> },
  { key: 'folders', label: 'Folders', icon: <HugeiconsIcon icon={ComputerPhoneSyncIcon} /> },
];

const BOTTOM_OFFSET = 16;
const TAB_BAR_HEIGHT = 64;
const SCROLL_THRESHOLD = 20;

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>('folders');
  const insets = useSafeAreaInsets();

  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const isTabBarVisible = useRef(true);
  const lastScrollY = useRef(0);
  const accumulatedDelta = useRef(0);

  const showTabBar = () => {
    if (isTabBarVisible.current) return;
    isTabBarVisible.current = true;
    Animated.spring(tabBarTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const hideTabBar = () => {
    if (!isTabBarVisible.current) return;
    isTabBarVisible.current = false;
    Animated.spring(tabBarTranslateY, {
      toValue: TAB_BAR_HEIGHT + BOTTOM_OFFSET + insets.bottom,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const delta = currentY - lastScrollY.current;
    lastScrollY.current = currentY;

    // Reset accumulator when direction changes
    if ((delta > 0 && accumulatedDelta.current < 0) || (delta < 0 && accumulatedDelta.current > 0)) {
      accumulatedDelta.current = 0;
    }
    accumulatedDelta.current += delta;

    if (accumulatedDelta.current > SCROLL_THRESHOLD) {
      hideTabBar();
      accumulatedDelta.current = 0;
    } else if (accumulatedDelta.current < -SCROLL_THRESHOLD) {
      showTabBar();
      accumulatedDelta.current = 0;
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    // Reset scroll state when switching tabs
    lastScrollY.current = 0;
    accumulatedDelta.current = 0;
    showTabBar();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {activeTab === 'photos' && <PhotosTab />}
      {activeTab === 'albums' && <AlbumsTab />}
      {activeTab === 'folders' && <FoldersTab onScroll={handleScroll} />}

      {/* Tab bar */}
      <Animated.View
        className="absolute self-center flex-row rounded-full p-1 border border-foreground/25 h-16 bg-muted"
        style={{ bottom: BOTTOM_OFFSET + insets.bottom, transform: [{ translateY: tabBarTranslateY }] }}
      >
        {TABS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => handleTabChange(key)}
            activeOpacity={0.8}
            className={cn('w-24 items-center justify-center rounded-full', activeTab === key ? 'bg-primary' : '')}
          >
            <Text
              className={cn('text-sm', activeTab === key ? '' : 'text-foreground/45')}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </SafeAreaView>
  );
};

export default HomeScreen;
