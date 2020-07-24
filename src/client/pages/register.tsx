import React from 'react';
import { NextPage } from 'next';
import { Layout } from '../components/Layout/Layout';
import Register from '../components/User/Register';

interface Props {}

const RegisterPage: NextPage<Props> = () => {

  return (
    <React.Fragment>
      <Layout hideHeader={false}><Register /></Layout>
    </React.Fragment>
  );
};

export default RegisterPage;
