import React, { useState } from 'react';
import { useContext } from 'react';
import UserContext from '../components/UserWrapper/UserContext';
import { NextPage } from 'next';
import { Layout } from '../components/Layout/Layout';
import ErrorMessage from '../components/Errors/ErrorMessage';
import Navigation from '../components/Navigation/Navigation';

interface Props {}

const Home: NextPage<Props> = () => {
  const { user } = useContext(UserContext);

  const [selectedMenu, setSelectedMenu] = useState<string>();

  return (
    <Layout hideHeader={false}>
      <div className="container">
        {user?.shop ? (
          <React.Fragment>
            <Navigation selected={setSelectedMenu} />
            {selectedMenu}
          </React.Fragment>
        ) : (
          <ErrorMessage
            error={`You don't have any shop assigned to you. Please contact your admin and get assigned to a Shop`}
          />
        )}
        <style jsx global>{``}</style>
      </div>
    </Layout>
  );
};

export default Home;
