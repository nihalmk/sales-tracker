import React from 'react';
import { NextPage } from 'next';
import { Layout } from '../components/Layout/Layout';
import Link from 'next/link';
import { Pages } from '../utils/pages';
import { Alert, Button } from '@chakra-ui/react';

interface Props {}

const Accounts: NextPage<Props> = () => {
  return (
    <Layout hideHeader={false}>
      <Alert.Root status="info" borderRadius="l2" mb={4}>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>
            Please send a mail to{' '}
            <strong>shoptrackerforsales@gmail.com</strong> to receive details
            regarding purchasing a paid account!
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
      <Button asChild colorPalette="brand" mt={3}>
        <Link href={Pages.DASHBOARD}>Go to home page</Link>
      </Button>
    </Layout>
  );
};

export default Accounts;
