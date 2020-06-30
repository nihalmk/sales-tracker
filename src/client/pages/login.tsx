import Head from 'next/head';
import { useState, useEffect } from 'react';
import { login } from '../accounts/login';
import { useRouter } from 'next/router';
import { Pages } from '../utils/pages';
import { NextPage } from 'next';
import Loader from '../components/Loaders/Loader';
import ErrorMessage from '../components/Errors/ErrorMessage';
import { Logo } from '../components/Header/Logo';
import { GET_USER } from '../graphql/query/user';
import { useQuery } from '@apollo/react-hooks';
import Link from 'next/link';

interface Props {}

export const Login: NextPage<Props> = function () {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const currentUser = useQuery(GET_USER, {
    fetchPolicy: 'no-cache',
  });

  const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e && e.preventDefault();
    setLoading(true);
    try {
      if (!email || !password) {
        setError('Email/Password required');
        setLoading(false);
        return;
      }
      await login(email, password);
      router.push(Pages.INDEX);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.data?.me) {
      router.push(Pages.DASHBOARD);
    }
  }, [currentUser]);

  if (currentUser.loading || currentUser?.data?.me) {
    return <Loader />;
  }
  return (
    <div className="container">
      <Head>
        <title>Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="row">
        <div className="col col-login mx-auto">
          <div className="text-center mb-6">
            <Logo setColor />
          </div>
          <form className="card" action="" method="post" onSubmit={onSubmit}>
            <div className="card-body p-6">
              <div className="card-title text-center">Sign in to your Shop</div>
            </div>
            <div className="card-body p-6">
              <ErrorMessage error={error}></ErrorMessage>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  name="email"
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter email"
                  onChange={onEmailChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Password
                  {/* <a className="float-right small" href="/forgot">
                    I forgot my password
                  </a> */}
                </label>
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  id="userPassword"
                  placeholder="Password"
                  onChange={onPasswordChange}
                />
              </div>
              <Link href="/forgot">Forgot Password?</Link>
              <div className="form-footer">
                <button
                  type="button"
                  onClick={onSubmit}
                  className={
                    'btn btn-primary btn-block ' + (isLoading && 'btn-loading')
                  }
                >
                  Sign in
                </button>
                <button type="submit" hidden></button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <style jsx>{``}</style>
    </div>
  );
};

export default Login;
