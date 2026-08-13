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
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { IconAttribute } from '../components/IconAttribute';
import {
  Box,
  Flex,
  Grid,
  Card,
  Heading,
  Text,
  Field,
  Input,
  Button,
  Image,
  Avatar,
} from '@chakra-ui/react';
import Icon from '../components/common/Icon';

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
    <Box minH="100vh" bg="gray.50">
      <Head>
        <title>Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex minH="100vh" align="center" justify="center" p={{ base: 4, md: 8 }}>
        <Grid
          w="full"
          maxW="5xl"
          templateColumns={{ base: '1fr', md: '3fr 2fr' }}
          gap={6}
        >
          <Card.Root
            display={{ base: 'none', md: 'block' }}
            variant="elevated"
            borderRadius="l3"
          >
            <Card.Body p={10}>
              <Flex justify="center" mb={8}>
                <Image src="/static/STName2.png" alt="Sales Tracker" />
              </Flex>
              <Flex gap={4} mb={6}>
                <Image
                  src="/static/STLogo.svg"
                  alt=""
                  boxSize="16"
                  bg="brand.50"
                  borderRadius="l2"
                  p={3}
                />
                <Box>
                  <Heading size="md" mb={2}>
                    Sales tracking made easy
                  </Heading>
                  <Text color="fg.muted">
                    Add your total stock, sales and purchases. Also track
                    current and previous sales. Track your profit on each sale.
                    Track your closing sales and tally the cash!
                  </Text>
                </Box>
              </Flex>
              <Flex
                align="center"
                gap={3}
                pt={4}
                borderTop="1px solid"
                borderColor="border.muted"
              >
                <Avatar.Root>
                  <Avatar.Fallback name="Shop Tracker" />
                </Avatar.Root>
                <Box>
                  <Text fontWeight="semibold">Shop Tracker</Text>
                  <Text fontSize="sm" color="fg.muted">
                    Contact: shoptrackerforsales@gmail.com
                  </Text>
                </Box>
              </Flex>
              <Text
                fontSize="sm"
                color="brand.700"
                bg="brand.50"
                borderRadius="l2"
                p={3}
                mt={6}
              >
                Let us know your feedback on{' '}
                <Text as="span" fontWeight="semibold">
                  shoptrackerforsales@gmail.com
                </Text>
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="elevated" borderRadius="l3">
            <Card.Header pt={8} pb={4} textAlign="center">
              <Flex justify="center" mb={4}>
                <Logo setColor />
              </Flex>
              <Heading size="lg">Sign in to your Shop</Heading>
            </Card.Header>
            <Card.Body>
              <ErrorMessage error={error}></ErrorMessage>
              <form onSubmit={onSubmit}>
                <Field.Root mb={4}>
                  {/* @ts-expect-error Chakra v3's Ark UI-derived FieldLabelProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
                  <Field.Label>Email address</Field.Label>
                  <Input
                    name="email"
                    type="email"
                    id="email"
                    placeholder="Enter email"
                    onChange={onEmailChange}
                    bg="white"
                  />
                </Field.Root>
                <Field.Root mb={2}>
                  {/* @ts-expect-error Chakra v3's Ark UI-derived FieldLabelProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
                  <Field.Label>Password</Field.Label>
                  <Input
                    name="password"
                    type="password"
                    id="userPassword"
                    placeholder="Password"
                    onChange={onPasswordChange}
                    bg="white"
                  />
                </Field.Root>
                <Link href="/forgot">
                  <Text as="span" fontSize="sm" color="brand.600">
                    Forgot Password?
                  </Text>
                </Link>
                <Box mt={6}>
                  <Button
                    type="button"
                    onClick={onSubmit}
                    colorPalette="brand"
                    w="full"
                    loading={isLoading}
                  >
                    <Icon name="login" light />
                    Log in
                  </Button>
                  <Link href={Pages.REGISTER} style={{ display: 'block' }}>
                    <Button type="button" colorPalette="green" w="full" mt={3}>
                      <Icon name="register" light />
                      Sign Up
                    </Button>
                  </Link>
                  <button type="submit" hidden></button>
                </Box>
              </form>
            </Card.Body>
          </Card.Root>
        </Grid>
      </Flex>
      <Box px={{ base: 3, md: 6 }} pb={4}>
        <IconAttribute />
      </Box>
    </Box>
  );
};

export default Login;
