import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

/**
 * Each @expo-google-fonts/* package exports a `useFonts` function, but we
 * want to load ALL font families together in one place so the rest of the
 * app never worries about fonts.
 *
 * The font name strings (e.g. 'SpaceGrotesk_700Bold') are what React Native
 * registers them as — they must match exactly what is used in the return of
 * require() calls.
 *
 * Fonts are loaded lazily inside the effect to avoid Node.js module resolution
 * failures in Jest (where .ttf files can't be require()'d).
 */
function getFontsToLoad(): Record<string, number> {
  // Space Grotesk
  const SpaceGrotesk_300Light = require('@expo-google-fonts/space-grotesk/300Light/SpaceGrotesk_300Light.ttf');
  const SpaceGrotesk_400Regular = require('@expo-google-fonts/space-grotesk/400Regular/SpaceGrotesk_400Regular.ttf');
  const SpaceGrotesk_500Medium = require('@expo-google-fonts/space-grotesk/500Medium/SpaceGrotesk_500Medium.ttf');
  const SpaceGrotesk_600SemiBold = require('@expo-google-fonts/space-grotesk/600SemiBold/SpaceGrotesk_600SemiBold.ttf');
  const SpaceGrotesk_700Bold = require('@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf');

  // Inter
  const Inter_400Regular = require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf');
  const Inter_500Medium = require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf');
  const Inter_600SemiBold = require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf');
  const Inter_700Bold = require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf');

  // IBM Plex Mono
  const IBMPlexMono_400Regular = require('@expo-google-fonts/ibm-plex-mono/400Regular/IBMPlexMono_400Regular.ttf');
  const IBMPlexMono_500Medium = require('@expo-google-fonts/ibm-plex-mono/500Medium/IBMPlexMono_500Medium.ttf');
  const IBMPlexMono_600SemiBold = require('@expo-google-fonts/ibm-plex-mono/600SemiBold/IBMPlexMono_600SemiBold.ttf');

  return {
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  };
}

export function useAppFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontsError, setFontsError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    try {
      const FONTS_TO_LOAD = getFontsToLoad();

      Font.loadAsync(FONTS_TO_LOAD)
        .then(() => {
          if (mounted) setFontsLoaded(true);
        })
        .catch((error) => {
          console.warn('[Fonts] Failed to load custom fonts:', error);
          if (mounted) {
            setFontsError(error instanceof Error ? error : new Error(String(error)));
            setFontsLoaded(true);
          }
        });
    } catch (error) {
      // In test environments, require() of .ttf files may fail
      console.warn('[Fonts] Could not resolve font assets (test environment?):', error);
      if (mounted) {
        setFontsLoaded(true);
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  return { fontsLoaded, fontsError };
}