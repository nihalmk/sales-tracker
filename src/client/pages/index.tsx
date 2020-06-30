import React, { useContext } from 'react';
import { useEffect } from 'react';
import { NextPage } from 'next';
import { clientLogger } from '../utils/logger';
import { useRouter } from 'next/router';
import { Pages } from '../utils/pages';
import Loader from '../components/Loaders/Loader';
import UserContext from '../components/UserWrapper/UserContext';
import AddShop from '../components/Shop/AddShop';
import { Layout } from '../components/Layout/Layout';

interface Props {}

const Home: NextPage<Props> = () => {
  const { user } = useContext(UserContext);

  const shop = user?.shop;

  const router = useRouter();
  useEffect(() => {
    if (shop) {
      clientLogger.log('redirecting to dashboard..');
      router.push(Pages.DASHBOARD);
    }
  }, [shop]);

  return (
    <React.Fragment>
      <Layout hideHeader={false}>{shop ? <Loader /> : <AddShop />}</Layout>
    </React.Fragment>
  );
};

export default Home;
