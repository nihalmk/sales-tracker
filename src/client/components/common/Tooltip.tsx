import React from 'react';
import { Portal, Tooltip as ChakraTooltip } from '@chakra-ui/react';

interface Props {
  content: React.ReactNode;
  children: React.ReactNode;
}

// Thin wrapper around Chakra v3's compound Tooltip parts (Root/Trigger/
// Positioner/Content), matching Chakra's own recommended snippet — kept
// here so callers don't have to wire up the parts themselves.
const Tooltip: React.FC<Props> = ({ content, children }) => (
  <ChakraTooltip.Root>
    {/* @ts-expect-error Chakra v3's Ark UI-derived TriggerProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
    <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
    <Portal>
      {/* @ts-expect-error Chakra v3's Ark UI-derived PositionerProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
      <ChakraTooltip.Positioner>
        {/* @ts-expect-error Chakra v3's Ark UI-derived ContentProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
        <ChakraTooltip.Content>{content}</ChakraTooltip.Content>
      </ChakraTooltip.Positioner>
    </Portal>
  </ChakraTooltip.Root>
);

export default Tooltip;
