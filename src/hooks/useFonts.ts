import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

const FONTS_TO_LOAD: Record<string, number> = {};

export function useAppFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontsError, setFontsError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    if (Object.keys(FONTS_TO_LOAD).length === 0) {
      // No fonts to load - mark as loaded immediately
      setFontsLoaded(true);
      return;
    }

    Font.loadAsync(FONTS_TO_LOAD)
      .then(() => {
        if (mounted) setFontsLoaded(true);
      })
      .catch((error) => {
        console.warn('[Fonts] Failed to load custom fonts:', error);
        if (mounted) {
          setFontsError(error instanceof Error ? error : new Error(String(error)));
          setFontsLoaded(true); // Continue even without custom fonts
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { fontsLoaded, fontsError };
}
