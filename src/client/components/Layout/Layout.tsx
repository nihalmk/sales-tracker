import * as React from 'react';
import Head from 'next/head';
import { Box } from '@chakra-ui/react';
import { Titles } from '../../utils/pages';
import { useRouter } from 'next/router';
import { Header } from '../Header/Header';
import { IconAttribute } from '../IconAttribute';

interface Props {
  children?: React.ReactNode;
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
    <Box minH="100vh" bg="gray.50">
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Header hide={hideHeader}></Header>
      <Box maxW="7xl" mx="auto" px={{ base: 3, md: 6 }} py={5}>
        <Box className="content">{children}</Box>
      </Box>
      <Box px={{ base: 3, md: 6 }}>
        <IconAttribute />
      </Box>
      <style jsx global>{`
        @media print {
          .hide-in-print {
            display: none !important;
          }
          .show-in-print {
            display: block !important;
          }
        }
      `}</style>
    </Box>
  );
};
