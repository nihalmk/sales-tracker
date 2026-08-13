import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Logo } from '../components/Header/Logo';
import {
  Alert,
  Box,
  Card,
  Flex,
  Heading,
  Text,
  Field,
  Input,
  Button,
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { RESET_PASSWORD } from '../graphql/mutation/user';
import { useRouter } from 'next/router';
import { clientLogger as logger } from '../utils/logger';
import Icon from '../components/common/Icon';

interface Props {}

interface Notification {
  message: string;
  type: string;
}

export const Forgot: NextPage<Props> = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [notification, setNotification] = useState(undefined);
  const [sendResetMail, {}] = useMutation(RESET_PASSWORD);
  const router = useRouter();
  const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  useEffect(() => {
    if (router.query.from === 'reset') {
      setNotification({
        type: 'danger',
        message:
          'Your password reset link is either invalid or expired. Create a new link below.',
      });
    }
  }, []);

  const sendMail = async () => {
    //validating
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      setNotification({
        type: 'danger',
        message: 'Invalid email address',
      });
      return;
    }
    setLoading(true);
    try {
      const res = await sendResetMail({
        variables: {
          email,
        },
      });
      let result = res.data.sendResetPasswordEmail;
      if (result) {
        setNotification({
          type: 'success',
          message:
            'An email with instructions to reset password has been sent.',
        });
      } else {
        setNotification({
          type: 'danger',
          message: 'User not found.',
        });
      }

      setLoading(false);
    } catch (ex) {
      logger.error(ex.Message);
      setLoading(false);
    }
  };

  const getNotification = (
    notificationObj: Notification,
  ): React.JSX.Element => {
    const status = notificationObj.type === 'danger' ? 'error' : 'success';
    return (
      <Alert.Root id="notification" status={status} borderRadius="l2" mb={4}>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>{notificationObj.message}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  };

  return (
    <Flex minH="100vh" bg="gray.50" align="center" justify="center" p={4}>
      <Box maxW="md" w="full">
        <Flex justify="center" mb={6}>
          <Logo setColor />
        </Flex>
        <Card.Root variant="elevated" borderRadius="l3">
          <Card.Header textAlign="center">
            <Flex justify="center" mb={2}>
              <Icon name="forgotPassword" boxSize={8} />
            </Flex>
            <Heading size="lg">Forgot Password</Heading>
          </Card.Header>
          <Card.Body>
            {notification && getNotification(notification)}
            <Text color="fg.muted" mb={4}>
              Enter your email address to receive an email with password
              reset instructions.
            </Text>

            <Field.Root mb={4}>
              {/* @ts-expect-error Chakra v3's Ark UI-derived FieldLabelProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
              <Field.Label>Email</Field.Label>
              <Input
                name="email"
                type="email"
                id="email"
                placeholder="Enter email"
                onChange={onEmailChange}
                bg="white"
              />
            </Field.Root>
            <Button
              type="button"
              onClick={sendMail}
              colorPalette="brand"
              w="full"
              loading={isLoading}
            >
              <Icon name="done" light />
              Send reset email
            </Button>
          </Card.Body>
        </Card.Root>
      </Box>
    </Flex>
  );
};

export default Forgot;
