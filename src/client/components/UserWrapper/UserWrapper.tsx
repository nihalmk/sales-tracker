import UserContext from './UserContext';
import { useQuery } from '@apollo/react-hooks';
import { GET_USER } from '../../graphql/query/user';
import { useRouter } from 'next/router';
import { Pages } from '../../utils/pages';
import Loader from '../Loaders/Loader';
import { clientLogger } from '../../utils/logger';
import { useEffect, useState } from 'react';
import { validateToken } from '../../accounts/login';
import React from 'react';
import moment from 'moment-timezone';
import { NavItems } from '../Navigation/Navigation';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageProps: any;
}

export const UserWrapper: React.FC<Props> = ({ Component, pageProps }) => {
  const [intervalCounter, setIntervalCounter] = useState<NodeJS.Timeout>();
  const [isPaid, setPaidUser] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<string>(NavItems.SALE);
  const [enabledNavItems, setNavItems] = useState<{ [key: string]: boolean; }>({
    sale: true,
    stock: true,
    purchase: true,
    purchases: true,
    sales: true,
    closing: true,
    report: true,
  }); 
  const currentUser = useQuery(GET_USER, {
    fetchPolicy: 'no-cache',
  });

  const router = useRouter();

  useEffect(() => {
    // check every 30 seconds if log in token is still valid
    if (!intervalCounter) {
      let intervalId = setInterval(async () => {
        validateToken();
      }, 30000);
      setIntervalCounter(intervalId);
    }

    return function cleanup() {
      if (intervalCounter) {
        clearInterval(intervalCounter);
      }
    };
  }, [intervalCounter]);

  useEffect(() => {
    if (
      currentUser.error ||
      (currentUser.data && currentUser.data.me === null)
    ) {
      clientLogger.log('Error', currentUser.error?.message);
      if (router.pathname !== Pages.LOGIN) {
        router.push(Pages.LOGIN);
      }
    }
    if (currentUser?.data?.me) {
      const TZ = currentUser?.data?.me?.shop?.timezone;
      if (TZ) {
        moment.tz.setDefault(TZ);
      }
      if (moment(currentUser?.data?.me.registeredAt).isBefore(moment().subtract(7, 'days')) && !currentUser?.data?.me.paid) {
        setPaidUser(false)
      }
    }
  }, [currentUser]);

  if (!currentUser.data && !currentUser.loading) {
    currentUser.refetch();
  }

  const clearContext = async () => {
    await currentUser.refetch();
  };

  const refetchUser = async () => {
    await currentUser.refetch();
  };

  const goToLogin = () => {
    if (router.pathname !== Pages.LOGIN) {
      router.push(Pages.LOGIN);
    }
    return <Loader />;
  };

  return (
    <React.Fragment>
      {currentUser.loading ? (
        <Loader />
      ) : (
        <React.Fragment>
          {currentUser?.data?.me ? (
            <UserContext.Provider
              value={{
                user: currentUser?.data?.me,
                loading: currentUser.loading,
                clearContext,
                refetchUser,
                enabledNavItems,
                setNavItems,
                setSelectedMenu,
                selectedMenu,
                isPaid
              }}
            >
              <Component {...pageProps} />
            </UserContext.Provider>
          ) : (
            goToLogin()
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default UserWrapper;
