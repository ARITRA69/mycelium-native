import { useEffect, useState } from 'react';

import { api } from '@/lib/api';

type TUserMeResponse = {
  message: string;
  data?: {
    user: {
      onboarding_complete: boolean;
    };
  };
};

type UseOnboardingReturn = {
  isLoaded: boolean;
  isOnboardingComplete: boolean;
  completeOnboarding: () => Promise<void>;
};

const useOnboarding = (): UseOnboardingReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    api
      .get('/user/me')
      .then((res: TUserMeResponse) => {
        setIsOnboardingComplete(res.data?.user?.onboarding_complete === true);
      })
      .catch(() => {
        setIsOnboardingComplete(false);
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  const completeOnboarding = async (): Promise<void> => {
    await api.patch('/user/me', { onboarding_complete: true });
    setIsOnboardingComplete(true);
  };

  return { isLoaded, isOnboardingComplete, completeOnboarding };
};

export { useOnboarding };
