import React, { ChangeEvent, useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_ITEM } from '../../graphql/mutation/items';
import { Items } from '../../generated/graphql';
import { removeUnderscoreKeys } from '../../utils/helpers';
import { getCategoryPlaceholderImage } from '../../utils/categoryPlaceholders';
import OverLay from '../OverLay';
import ErrorMessage from '../Errors/ErrorMessage';
import Input from '../common/Inputs/FormInput';
import Icon from '../common/Icon';
import { Box, Button, HStack, IconButton, Image, Text } from '@chakra-ui/react';

// No dedicated "image" icon exists in the shared PNG icon set (Icon.tsx) —
// a small inline SVG instead, matching this codebase's own convention for
// one-off icons (see ExpandableSection's chevron, DiscountBanner's icons).
export const ImageIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path
      d="M21 15l-5-5L5 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface Props {
  item: Items;
  onClose: () => void;
  // Called after any successful save, so the caller can refetch/refresh
  // its own item list rather than this modal trying to patch it directly.
  onSaved?: () => void;
}

// View + manage every image URL on an item: a simple carousel (Prev/Next
// when there's more than one), the current slide's URL shown in an
// editable field that saves in place, plus Remove and Add-another actions.
// With no images at all, shows a category-specific placeholder instead of
// a blank box, and the same editable field just adds the first image.
const ItemImagesModal: React.FC<Props> = ({ item, onClose, onSaved }) => {
  const [images, setImages] = useState<string[]>(item.imageUrls || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [urlDraft, setUrlDraft] = useState(images[0] || '');
  const [newUrlDraft, setNewUrlDraft] = useState('');
  const [error, setError] = useState('');
  const [submitUpdateItem, { loading }] = useMutation(UPDATE_ITEM);

  const hasImages = images.length > 0;
  const displayedUrl = hasImages
    ? images[currentIndex]
    : getCategoryPlaceholderImage(item.category);

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setUrlDraft(images[index] || '');
    setError('');
  };

  const persist = async (nextImages: string[]) => {
    try {
      await submitUpdateItem({
        variables: {
          _id: item._id,
          name: item.name,
          category: item.category,
          price: removeUnderscoreKeys(item.price),
          stock: item.stock,
          imageUrls: nextImages,
        },
      });
      setImages(nextImages);
      onSaved?.();
      return true;
    } catch (e) {
      setError(`Error saving image. ${e.message}`);
      return false;
    }
  };

  const onSaveCurrent = async () => {
    const trimmed = urlDraft.trim();
    if (!trimmed) {
      setError('Enter an image URL before saving.');
      return;
    }
    const nextImages = [...images];
    if (hasImages) {
      nextImages[currentIndex] = trimmed;
    } else {
      nextImages.push(trimmed);
    }
    const ok = await persist(nextImages);
    if (ok) {
      setCurrentIndex(hasImages ? currentIndex : 0);
    }
  };

  const onRemoveCurrent = async () => {
    if (!hasImages) {
      return;
    }
    const nextImages = [...images];
    nextImages.splice(currentIndex, 1);
    const ok = await persist(nextImages);
    if (ok) {
      const nextIndex = Math.min(currentIndex, nextImages.length - 1);
      setCurrentIndex(Math.max(nextIndex, 0));
      setUrlDraft(nextImages[Math.max(nextIndex, 0)] || '');
    }
  };

  const onAddNew = async () => {
    const trimmed = newUrlDraft.trim();
    if (!trimmed) {
      setError('Enter an image URL to add.');
      return;
    }
    const nextImages = [...images, trimmed];
    const ok = await persist(nextImages);
    if (ok) {
      setNewUrlDraft('');
      goTo(nextImages.length - 1);
    }
  };

  return (
    <OverLay show className="hide-in-print">
      <Box p={4}>
        <HStack justify="space-between" mb={3}>
          <Text fontWeight="semibold">{item.name} — Images</Text>
          <Button size="sm" variant="outline" onClick={onClose}>
            <Icon name="cancel" />
            Close
          </Button>
        </HStack>
        <ErrorMessage error={error} />

        <HStack justify="center" gap={3} mb={3}>
          <IconButton
            aria-label="Previous image"
            size="sm"
            variant="outline"
            disabled={!hasImages || images.length < 2}
            onClick={() =>
              goTo((currentIndex - 1 + images.length) % images.length)
            }
          >
            ‹
          </IconButton>
          <Box
            w="240px"
            h="240px"
            borderWidth="1px"
            borderColor="border"
            borderRadius="l2"
            overflow="hidden"
            flexShrink={0}
          >
            <Image
              src={displayedUrl}
              alt={item.name}
              w="full"
              h="full"
              objectFit="cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                (e.target as HTMLImageElement).src =
                  getCategoryPlaceholderImage(item.category);
              }}
            />
          </Box>
          <IconButton
            aria-label="Next image"
            size="sm"
            variant="outline"
            disabled={!hasImages || images.length < 2}
            onClick={() => goTo((currentIndex + 1) % images.length)}
          >
            ›
          </IconButton>
        </HStack>

        {hasImages && (
          <Text textAlign="center" fontSize="xs" color="fg.muted" mb={3}>
            {currentIndex + 1} of {images.length}
          </Text>
        )}
        {!hasImages && (
          <Text textAlign="center" fontSize="xs" color="fg.muted" mb={3}>
            No images yet — showing a generic {item.category || 'Others'}{' '}
            placeholder. Add one below.
          </Text>
        )}

        <HStack mb={2} align="flex-end">
          <Box flex="1">
            <Input
              inputName="imageUrl"
              inputLabel={hasImages ? 'Image URL' : 'Add first image URL'}
              inputType="text"
              max={500}
              placeholderValue="https://..."
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUrlDraft(e.target.value)
              }
              value={urlDraft}
              disabled={loading}
            />
          </Box>
          <Button
            colorPalette="brand"
            loading={loading}
            onClick={onSaveCurrent}
          >
            Save
          </Button>
          {hasImages && (
            <Button
              colorPalette="red"
              variant="outline"
              disabled={loading}
              onClick={onRemoveCurrent}
            >
              Remove
            </Button>
          )}
        </HStack>

        {hasImages && (
          <HStack align="flex-end">
            <Box flex="1">
              <Input
                inputName="newImageUrl"
                inputLabel="Add another image"
                inputType="text"
                max={500}
                placeholderValue="https://..."
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewUrlDraft(e.target.value)
                }
                value={newUrlDraft}
                disabled={loading}
              />
            </Box>
            <Button
              variant="outline"
              colorPalette="brand"
              loading={loading}
              onClick={onAddNew}
            >
              <Icon name="add" />
              Add
            </Button>
          </HStack>
        )}
      </Box>
    </OverLay>
  );
};

export default ItemImagesModal;
