import React from 'react';
import { NextPage } from 'next';
import { Layout } from '../components/Layout/Layout';
import StoreSettings from '../components/Store/StoreSettings';

interface Props {}

const StoreSettingsPage: NextPage<Props> = () => {
  return (
    <Layout>
      <StoreSettings />
    </Layout>
  );
};

export default StoreSettingsPage;
