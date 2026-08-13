import React from 'react';
import { Box, Text } from '@chakra-ui/react';

interface Props {
  description?: string;
  show: boolean;
}

const PopUpMessage: React.FC<Props> = ({ description, show }) => {
  return (
    <Box
      visibility={show ? 'visible' : 'hidden'}
      transition="visibility 0s, opacity 0.5s ease"
      position="fixed"
      zIndex="toast"
      w="25%"
      bottom="5%"
      right="3%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      borderRadius="full"
      cursor="pointer"
      bg="green.600"
      px={4}
      py={2}
    >
      <Text color="white" fontSize="sm" pl={2}>
        {description}
      </Text>
    </Box>
  );
};

export default PopUpMessage;
