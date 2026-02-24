import { useUser } from '@clerk/clerk-expo';

type UseOnboardingReturn = {
  isLoaded: boolean;
  isOnboardingComplete: boolean;
  completeOnboarding: () => Promise<void>;
};

const useOnboarding = (): UseOnboardingReturn => {
  const { user, isLoaded } = useUser();

  const isOnboardingComplete = isLoaded
    ? user?.unsafeMetadata?.onboardingComplete === true
    : false;

  const completeOnboarding = async (): Promise<void> => {
    await user?.update({
      unsafeMetadata: { ...user.unsafeMetadata, onboardingComplete: true },
    });
  };

  return { isLoaded, isOnboardingComplete, completeOnboarding };
};

export { useOnboarding };
