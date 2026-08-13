import React from 'react';
import { Box } from '@chakra-ui/react';

interface Props {
  children?: React.ReactNode;
  className?: string;
  show?: boolean;
}
const OverLay: React.FC<Props> = ({ children, className, show }) => {
  if (!show) {
    return null;
  }
  return (
    <Box
      position="fixed"
      inset={0}
      zIndex="overlay"
      pt="100px"
      overflow="auto"
      bg="blackAlpha.500"
    >
      <Box
        className={className}
        bg="bg.panel"
        borderRadius="l2"
        mx="auto"
        mb={5}
        border="1px solid"
        borderColor="border"
        w="65%"
      >
        {children}
      </Box>
    </Box>
  );
};

export default OverLay;
