import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useUser } from '@clerk/clerk-expo';
import * as MediaLibrary from 'expo-media-library';

import { useOnboarding } from '@/hooks/use-onboarding';

const MAX_DATE = new Date();
const MIN_DATE = new Date(1900, 0, 1);
const DEFAULT_PICKER_DATE = new Date(2000, 0, 1);

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const OnboardingScreen = () => {
  const { user } = useUser();
  const { completeOnboarding } = useOnboarding();

  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const [name, setName] = useState(
    [user?.firstName, user?.lastName].filter(Boolean).join(' '),
  );
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date): void => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleStep1Next = async (): Promise<void> => {
    try {
      setIsSaving(true);
      const trimmed = name.trim();
      const spaceIdx = trimmed.indexOf(' ');
      const firstName = spaceIdx > -1 ? trimmed.slice(0, spaceIdx) : trimmed;
      const lastName = spaceIdx > -1 ? trimmed.slice(spaceIdx + 1) : '';

      await user?.update({
        firstName,
        lastName: lastName || undefined,
        unsafeMetadata: {
          ...user.unsafeMetadata,
          dateOfBirth: dateOfBirth?.toISOString() ?? null,
        },
      });

      setStep(2);
    } catch (err) {
      console.error('Failed to save personal info:', err);
      Alert.alert('Error', 'Failed to save your details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestPermissions = async (): Promise<void> => {
    if (isCompleting) return;
    try {
      setIsCompleting(true);
      await MediaLibrary.requestPermissionsAsync(false, ['photo', 'video']);
      await completeOnboarding();
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkipPermissions = async (): Promise<void> => {
    if (isCompleting) return;
    try {
      setIsCompleting(true);
      await completeOnboarding();
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-16 pb-10">
          {/* Step progress bar */}
          <View className="flex-row gap-2 mb-10">
            {[1, 2].map((s) => (
              <View
                key={s}
                className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-white/10'}`}
              />
            ))}
          </View>

          {step === 1 ? (
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground mb-2">
                Confirm your details
              </Text>
              <Text className="text-muted-foreground mb-8">
                Make sure everything looks right before we get started.
              </Text>

              {/* Full name */}
              <View className="mb-5">
                <Text className="text-sm text-muted-foreground mb-2">Full name</Text>
                <TextInput
                  className="border border-border rounded-xl px-4 py-4 text-foreground text-base"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  autoCapitalize="words"
                  returnKeyType="done"
                />
              </View>

              {/* Email (non-editable) */}
              <View className="mb-5">
                <Text className="text-sm text-muted-foreground mb-2">Email</Text>
                <View
                  className="border border-border rounded-xl px-4 py-4 flex-row items-center gap-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <Text className="text-muted-foreground text-base flex-1" numberOfLines={1}>
                    {email}
                  </Text>
                  <View
                    className="rounded-md px-2 py-1"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <Text className="text-muted-foreground text-xs">Verified</Text>
                  </View>
                </View>
              </View>

              {/* Date of birth */}
              <View className="mb-8">
                <Text className="text-sm text-muted-foreground mb-2">Date of birth</Text>
                <TouchableOpacity
                  className="border border-border rounded-xl px-4 py-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                  onPress={() => setShowDatePicker(!showDatePicker)}
                  activeOpacity={0.7}
                >
                  <Text
                    className="text-base"
                    style={{ color: dateOfBirth ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }}
                  >
                    {dateOfBirth ? formatDate(dateOfBirth) : 'Select your date of birth'}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <View className="mt-2 rounded-xl overflow-hidden">
                    <DateTimePicker
                      value={dateOfBirth ?? DEFAULT_PICKER_DATE}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      onChange={onDateChange}
                      maximumDate={MAX_DATE}
                      minimumDate={MIN_DATE}
                      themeVariant="dark"
                      accentColor="#a855f7"
                    />
                  </View>
                )}
              </View>

              <View className="flex-1" />

              <TouchableOpacity
                className="w-full items-center justify-center rounded-xl py-4 px-6"
                style={{
                  backgroundColor: !name.trim() || isSaving ? 'rgba(168,85,247,0.4)' : '#a855f7',
                }}
                onPress={handleStep1Next}
                disabled={isSaving || !name.trim()}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold text-lg">Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* Step 2 — Permissions */
            <View className="flex-1">
              <TouchableOpacity className="mb-8 self-start" onPress={() => setStep(1)}>
                <Text className="text-muted-foreground text-base">← Back</Text>
              </TouchableOpacity>

              <View className="flex-1 items-center justify-center">
                <View
                  className="w-28 h-28 rounded-3xl items-center justify-center mb-8"
                  style={{ backgroundColor: 'rgba(168,85,247,0.15)' }}
                >
                  <Text style={{ fontSize: 52 }}>🖼️</Text>
                </View>

                <Text className="text-3xl font-bold text-foreground text-center mb-4">
                  Access your library
                </Text>
                <Text
                  className="text-center text-base leading-6 px-4"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  Mycelium needs access to your photos and videos to help you organise and relive
                  your memories.
                </Text>
              </View>

              <View className="w-full gap-3">
                <TouchableOpacity
                  className="w-full items-center justify-center rounded-xl py-4 px-6"
                  style={{ backgroundColor: isCompleting ? 'rgba(168,85,247,0.4)' : '#a855f7' }}
                  onPress={handleRequestPermissions}
                  disabled={isCompleting}
                  activeOpacity={0.8}
                >
                  {isCompleting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white font-semibold text-lg">Allow Access</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-full items-center justify-center py-3"
                  onPress={handleSkipPermissions}
                  disabled={isCompleting}
                  activeOpacity={0.7}
                >
                  <Text className="text-muted-foreground font-medium">Skip for now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OnboardingScreen;
