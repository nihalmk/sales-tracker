import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_NETWORK_STATUS, NetworkStatus } from '../graphql/query/network';
import { Box, Heading } from '@chakra-ui/react';

interface Props {}
const NetworkConnectionStatus: React.FC<Props> = () => {
  const [online, setOnline] = useState(false);
  const { data: networkStatus } = useQuery<NetworkStatus>(GET_NETWORK_STATUS);
  const status = networkStatus?.networkStatus.isConnected;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (status) {
      timeout = setTimeout(() => {
        setOnline(true);
      }, 5000);
    } else {
      setOnline(false);
    }
    return function cleanup() {
      timeout && clearTimeout(timeout);
    };
  }, [networkStatus]);
  return (
    <Box
      display={online ? 'none' : 'block'}
      position="fixed"
      bottom={0}
      left={0}
      w={{ base: 'full', md: '35%' }}
      zIndex="toast"
      bg={status ? 'green.500' : 'red.500'}
      color="white"
      textAlign="center"
      py={3}
      px={4}
      transition="opacity 5s ease-out"
    >
      <Heading size="sm">
        {status
          ? 'Connected!'
          : 'Unable to connect servers. Please check your internet connection!'}
      </Heading>
    </Box>
  );
};

export default NetworkConnectionStatus;
