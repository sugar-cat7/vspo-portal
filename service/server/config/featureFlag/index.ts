import { InMemoryProvider, OpenFeature } from "@openfeature/server-sdk";
import type { FeatureFlagEnv } from "../env/flag";

/**
 * Creates feature flag configuration based on environment variables
 * @param env The feature flag environment variables
 * @returns The feature flag configuration
 */
export const createFlagConfiguration = (env: FeatureFlagEnv) => {
  return {
    "discord-translation-setting": {
      variants: {
        on: true,
        off: false,
      },
      disabled: false,
      defaultVariant: env.DISCORD_TRANSLATION_SETTING ? "on" : "off",
    },
  } as const;
};

/**
 * Sets the feature flag provider for OpenFeature
 * @param provider The provider to set
 */
export const setFeatureFlagProvider = async (env: FeatureFlagEnv) => {
  const provider = new InMemoryProvider({});
  const flags = createFlagConfiguration(env);
  provider.putConfiguration(flags);
  OpenFeature.setProvider(provider);
};
