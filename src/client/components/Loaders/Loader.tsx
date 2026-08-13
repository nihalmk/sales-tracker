import React from 'react';
import { Center, VStack, Spinner, Text } from '@chakra-ui/react';
import { Logo } from '../Header/Logo';

const Loader = () => (
  <Center minH="40vh" py={12}>
    <VStack gap={4}>
      <Logo setColor />
      <Spinner size="lg" color="brand.600" />
      <Text color="fg.muted" fontSize="sm">
        Loading...
      </Text>
    </VStack>
  </Center>
);

export default Loader;
