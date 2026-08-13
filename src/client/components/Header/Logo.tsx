import React from 'react';
import { Image } from '@chakra-ui/react';

interface Props {
  setColor?: boolean;
}
export const Logo: React.FC<Props> = ({}) => {
  return <Image src="/static/STLogo.svg" alt="" boxSize="7" />;
};
