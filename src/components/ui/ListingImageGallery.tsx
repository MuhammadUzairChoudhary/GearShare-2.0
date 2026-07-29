import React, { useState } from 'react';
import { View, Image, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius } from '../../theme/spacing';
import { AppText } from './AppText';
import type { ListingImage } from '../../types/listing';

interface ListingImageGalleryProps {
  images: ListingImage[];
  fallbackLabel?: string;
  testID?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function ListingImageGallery({
  images,
  fallbackLabel = 'No images available',
  testID,
}: ListingImageGalleryProps) {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sortedImages.length === 0) {
    return (
      <View
        style={{
          height: 300,
          backgroundColor: colors.surface,
          borderRadius: radius.image,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        testID={testID}
      >
        <AppText variant="bodyMedium" color="textTertiary">
          {fallbackLabel}
        </AppText>
      </View>
    );
  }

  return (
    <View testID={testID}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(index);
        }}
      >
        {sortedImages.map((image, index) => (
          <View
            key={image.id}
            style={{
              width: SCREEN_WIDTH - 32,
              height: 300,
              marginRight: index < sortedImages.length - 1 ? 8 : 0,
            }}
          >
            <Image
              source={{ uri: image.storagePath }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: radius.image,
              }}
              resizeMode="cover"
              accessibilityLabel={`Listing image ${index + 1}`}
            />
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      {sortedImages.length > 1 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
            marginTop: 12,
          }}
        >
          {sortedImages.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index === activeIndex ? colors.signalLime : colors.graphite500,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
