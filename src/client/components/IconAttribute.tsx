import React from 'react';
import { Text, Link } from '@chakra-ui/react';

export const IconAttribute = () => {
  return (
    <Text
      position="relative"
      float="right"
      fontSize="xs"
      color="fg.subtle"
      mr={2}
    >
      Icons made by{' '}
      <Link
        href="https://www.flaticon.com/authors/smashicons"
        title="Smashicons"
        color="brand.600"
      >
        Smashicons
      </Link>{' '}
      and{' '}
      <Link
        href="https://www.flaticon.com/authors/magnific"
        title="Magnific"
        color="brand.600"
      >
        Magnific
      </Link>{' '}
      from{' '}
      <Link href="https://www.flaticon.com/" title="Flaticon" color="brand.600">
        www.flaticon.com
      </Link>
    </Text>
  );
};
