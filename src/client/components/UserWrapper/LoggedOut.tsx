import * as React from 'react';
import { Layout } from '../Layout/Layout';
import { useRouter } from 'next/router';
import { Pages } from '../../utils/pages';
import { NextPage } from 'next';
import { Box, Heading, Button } from '@chakra-ui/react';

interface Props {
  error: boolean;
}
export const LoggedOut: NextPage<Props> = ({ error }) => {
  const [isLoading, setLoading] = React.useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    setLoading(true);
    try {
      router.push(Pages.LOGIN);
    } catch (e) {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    router.push(Pages.LOGIN);
  }, [error]);

  return (
    <Layout>
      <Box maxW="sm" mx="auto" textAlign="center" py={10}>
        <Heading size="md" mb={4}>You are not logged in</Heading>
        <Button
          colorPalette="brand"
          w="full"
          loading={isLoading}
          onClick={onSubmit}
        >
          Log in
        </Button>
      </Box>
    </Layout>
  );
};
