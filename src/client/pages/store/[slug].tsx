import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_PUBLIC_SHOP } from '../../graphql/query/store';
import Storefront from '../../components/Store/Storefront';
import Loader from '../../components/Loaders/Loader';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';

interface Props {}

// Public, unauthenticated page - deliberately not registered in
// AuthenticatedPages (see utils/pages.tsx), so _app.tsx renders it without
// the internal UserWrapper/login gate.
const StorePage: NextPage<Props> = () => {
  const router = useRouter();
  const slug = router.query.slug as string;

  const { data, loading } = useQuery(GET_PUBLIC_SHOP, {
    variables: { slug },
    skip: !slug,
    fetchPolicy: 'no-cache',
  });

  if (!router.isReady || loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Loader />
      </Box>
    );
  }

  const shop = data?.getPublicShop;

  if (!shop) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" px={4}>
        <Head>
          <title>Store not found</title>
        </Head>
        <VStack gap={2} textAlign="center">
          <Heading size="lg">Store not found</Heading>
          <Text color="fg.muted">
            This store link doesn&apos;t exist or isn&apos;t published yet.
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <React.Fragment>
      <Head>
        <title>{shop.name}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Storefront shop={shop} />
    </React.Fragment>
  );
};

export default StorePage;
