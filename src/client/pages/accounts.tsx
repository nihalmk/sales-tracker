import React from 'react';
import { NextPage } from 'next';
import { Layout } from '../components/Layout/Layout';
import Link from 'next/link';
import { Pages } from '../utils/pages';

interface Props {}

const Accounts: NextPage<Props> = () => {
  return (
    <React.Fragment>
      <Layout hideHeader={false}>
        <div className="alert alert-primary" role="alert">
          Please send a mail to <strong>shoptrackerforsales@gmail.com</strong>{' '}
          to receive details regarding purchasing a paid account!
        </div>
        <Link href={Pages.DASHBOARD}>
          <button className="btn btn-primary mt-3">Go to home page</button>
        </Link>
      </Layout>
    </React.Fragment>
  );
};

export default Accounts;
