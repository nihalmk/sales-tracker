import * as React from 'react';
import { Layout } from '../Layout/Layout';
import { useRouter } from 'next/router';
import { Pages } from '../../utils/pages';
import { NextPage } from 'next';

interface Props {
  error: boolean;
}
export const LoggedOut: NextPage<Props> = ({ error }) => {
  const [isLoading, setLoading] = React.useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    setLoading(true);
    try {
      router.push(Pages.LOGIN);
    } catch (e) {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    router.push(Pages.LOGIN);
  }, [error]);

  return (
    <Layout>
      <div className="row">
        <div className="col col-login mx-auto">
          <h3>You are not logged in</h3>
          <button
            type="button"
            onClick={onSubmit}
            className={
              'btn btn-primary btn-block ' + (isLoading && 'btn-loading')
            }
          >
            Log in
          </button>
        </div>
      </div>
    </Layout>
  );
};
