import * as React from 'react';
import Head from 'next/head';
import { Site, Page } from 'tabler-react';
import { Titles } from '../../utils/pages';
import { useRouter } from 'next/router';
import { Header } from '../Header/Header';

interface Props {
  children?: object;
  hideHeader?: boolean;
}

const getTitle = (url: string) => {
  const path = url.split('/')[1] ? '/' + url.split('/')[1] : url;
  return Titles[path];
};

export const Layout: React.FC<Props> = ({ children, hideHeader }) => {
  const [title, setTitle] = React.useState(Titles.HOME);
  const router = useRouter();
  const path = router.pathname;

  React.useEffect(() => {
    setTitle(getTitle(path));
  }, [path]);

  return (
    <Site>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Header hide={hideHeader}></Header>
      <Page>
        <Page.Content>{children}</Page.Content>
      </Page>
      <style jsx global>{`
        .bg-blue-global {
          background: #1a74c5;
        }
        .body {
          background: #f7c5c7;
        }
        .profit {
          color: green;
        }
        .loss {
          color: red;
        }
        .page-content {
          margin-top: 0
        }
        @media (max-width: 768px) {
          .hide-small-screen {
            display: none;
          }
        }
      `}</style>
    </Site>
  );
};
