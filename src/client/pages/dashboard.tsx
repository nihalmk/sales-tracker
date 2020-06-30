import React, { useState } from 'react';
import { useContext } from 'react';
import UserContext from '../components/UserWrapper/UserContext';
import { NextPage } from 'next';
import { Layout } from '../components/Layout/Layout';
import ErrorMessage from '../components/Errors/ErrorMessage';
import Navigation from '../components/Navigation/Navigation';
import AddStock from '../components/Stock/AddStock';

interface Props {}

const Home: NextPage<Props> = () => {
  const { user } = useContext(UserContext);

  const [selectedMenu, setSelectedMenu] = useState<string>();

  const component = () => {
    switch (selectedMenu) {
      case 'stock':
        return <AddStock />;
      default:
        return <div className="text-center">Not Available</div>;
    }
  };
  return (
    <Layout hideHeader={false}>
      <div className="container">
        {user?.shop ? (
          <React.Fragment>
            <Navigation selected={setSelectedMenu} />
            <div className="mt-5">
            {component()}
            </div>
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
