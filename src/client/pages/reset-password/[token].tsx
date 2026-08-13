import React, { useState } from 'react';
import { NextPage } from 'next';
import { Logo } from '../../components/Header/Logo';
import { accountsPassword } from '../../../accounts/client';
import { useRouter } from 'next/router';
import cookie from 'js-cookie';
import {
  Box,
  Card,
  Flex,
  Heading,
  Text,
  Field,
  Input,
  Button,
} from '@chakra-ui/react';
import Icon from '../../components/common/Icon';

interface Props {}

export const Reset: NextPage<Props> = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const token: string = router.query.token.toString();

  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  const onConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(event.target.value);
  };

  const changePassword = async () => {
    setLoading(true);
    try {
      const resp = await accountsPassword.resetPassword(token, password);
      cookie.remove('token');
      cookie.set('token', resp.tokens.accessToken, { expires: 1 });
      router.push('/');
    } catch (ex) {
      router.push('/forgot?from=reset');
    }
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
              <Icon name="resetPassword" boxSize={8} />
            </Flex>
            <Heading size="lg">Reset Password</Heading>
          </Card.Header>
          <Card.Body>
            <Text color="fg.muted" mb={4}>
              Enter your new password below to reset the password of your
              account.
            </Text>
            <Field.Root mb={4}>
              {/* @ts-expect-error Chakra v3's Ark UI-derived FieldLabelProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
              <Field.Label>New Password</Field.Label>
              <Input
                name="password"
                type="password"
                id="password"
                placeholder="Password"
                onChange={onPasswordChange}
                bg="white"
              />
            </Field.Root>
            <Field.Root mb={4}>
              {/* @ts-expect-error Chakra v3's Ark UI-derived FieldLabelProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
              <Field.Label>Confirm New Password</Field.Label>
              <Input
                name="confirmPassword"
                type="password"
                id="confirmPassword"
                placeholder="Password"
                onChange={onConfirmPasswordChange}
                bg="white"
              />
            </Field.Root>
            <Button
              type="button"
              onClick={changePassword}
              colorPalette="brand"
              w="full"
              loading={isLoading}
              disabled={password === '' || password !== confirmPassword}
            >
              <Icon name="done" light />
              Reset password
            </Button>
          </Card.Body>
        </Card.Root>
      </Box>
    </Flex>
  );
};

export default Reset;
