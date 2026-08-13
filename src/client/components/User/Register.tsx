import React, { useState, FormEvent } from 'react';
import _ from 'lodash';
import Input from '../common/Inputs/FormInput';
import Link from 'next/link';
import { Pages } from '../../utils/pages';
import { useMutation } from '@apollo/client';
import { CREATE_NEW_USER } from '../../graphql/mutation/user';
import ErrorMessage from '../Errors/ErrorMessage';
import { useRouter } from 'next/router';
import SuccessMessage from '../Alerts/SuccessMessage';
import { Box, Card, Heading, Button, HStack, Stack } from '@chakra-ui/react';
import Icon from '../common/Icon';

const Register: React.FC<{}> = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [newData, setNewData] = useState({
    currentUser: {},
    form: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    isSubmitTriggered: false,
  });
  const [createNewUser, { loading: mutationLoading }] = useMutation(
    CREATE_NEW_USER,
  );

  const verifyEmail = (email: string): boolean => {
    if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      return true;
    } else {
      return false;
    }
  };

  const handleFirstNameChange = (event: React.SyntheticEvent): void => {
    const firstName = _.get(event, 'target.value');
    setNewData((c) => ({
      ...c,
      form: {
        ...c.form,
        firstName,
      },
    }));
  };

  const handleEmailChange = (event: React.SyntheticEvent): void => {
    const email = _.get(event, 'target.value');
    setNewData((c) => ({
      ...c,
      form: {
        ...c.form,
        email,
      },
    }));
  };

  const handleLastNameChange = (event: React.SyntheticEvent): void => {
    const lastName = _.get(event, 'target.value');
    setNewData((c) => ({
      ...c,
      form: {
        ...c.form,
        lastName,
      },
    }));
  };

  const handlePhoneChange = (event: React.SyntheticEvent): void => {
    const phone = _.get(event, 'target.value');
    setNewData((c) => ({
      ...c,
      form: {
        ...c.form,
        phone,
      },
    }));
  };

  const handlePasswordChange = (event: React.SyntheticEvent): void => {
    const password = _.get(event, 'target.value');
    setNewData((c) => ({
      ...c,
      form: {
        ...c.form,
        password,
      },
    }));
  };

  const handleConfirmPasswordChange = (event: React.SyntheticEvent): void => {
    const password = _.get(event, 'target.value');
    setNewData((c) => ({
      ...c,
      form: {
        ...c.form,
        confirmPassword: password,
      },
    }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    let updatedData = { ...newData };
    updatedData.isSubmitTriggered = true;
    const form = newData.form;

    if (
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.email.trim() &&
      form.phone &&
      form.password &&
      form.confirmPassword
    ) {
      if (!verifyEmail(form.email.trim())) {
        setError('Please enter valid email');
      } else if (form.password !== form.confirmPassword) {
        setError(`Password confirmation doesn't match`);
      } else {
        try {
          await createNewUser({
            variables: {
              user: {
                password: form.password,
                email: form.email,
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                phone: form.phone,
              },
            },
          });
          setMessage(
            `Registration successful. Please login with your new credentials`,
          );
          router.push(Pages.LOGIN);
        } catch (e) {
          setError(e.message);
        } finally {
          updatedData.isSubmitTriggered = false;
        }
      }
    } else {
      setError(`Please enter all required fields!`);
    }
    setNewData(updatedData);
  };

  return (
    <Box maxW="md" mx="auto">
      <Card.Root variant="elevated" borderRadius="l3">
        <form onSubmit={onSubmit}>
          <Card.Header>
            <HStack gap={2}>
              <Icon name="register" boxSize={6} />
              <Heading size="lg">Register</Heading>
            </HStack>
          </Card.Header>
          <Card.Body>
            <ErrorMessage error={error} />
            <SuccessMessage message={message} />
            <Stack gap={4}>
            <Input
              value={newData.form.firstName.trim()}
              tabIndex={1}
              inputName="firstName"
              inputLabel="First Name"
              inputType="text"
              placeholderValue="First Name"
              onChange={handleFirstNameChange}
              isInvalid={
                newData.isSubmitTriggered && !newData.form.firstName.trim()
              }
            />
            <Input
              value={newData.form.lastName.trim()}
              tabIndex={2}
              inputName="lastName"
              inputLabel="Last Name"
              inputType="text"
              placeholderValue="Last Name"
              onChange={handleLastNameChange}
              isInvalid={
                newData.isSubmitTriggered && !newData.form.lastName.trim()
              }
            />
            <Input
              value={newData.form.phone.trim()}
              tabIndex={3}
              inputName="Phone"
              inputLabel="Phone"
              inputType="tel"
              placeholderValue="Phone Number"
              onChange={handlePhoneChange}
              isInvalid={
                newData.isSubmitTriggered && !newData.form.phone.trim()
              }
            />
            <Input
              value={newData.form.email.trim()}
              tabIndex={4}
              inputName="email"
              inputLabel="Email"
              inputType="text"
              placeholderValue="Email"
              onChange={handleEmailChange}
              isInvalid={
                newData.isSubmitTriggered && !newData.form.email.trim()
              }
            />

            <Input
              value={newData.form.password.trim()}
              tabIndex={5}
              inputName="password"
              inputLabel="Password"
              inputType="password"
              placeholderValue="Password"
              onChange={handlePasswordChange}
              isInvalid={
                newData.isSubmitTriggered && !newData.form.password.trim()
              }
            />

            <Input
              value={newData.form.confirmPassword.trim()}
              tabIndex={3}
              inputName="confirmPassword"
              inputLabel="Confirm Password"
              inputType="password"
              placeholderValue="Confirm Password"
              onChange={handleConfirmPasswordChange}
              isInvalid={
                (newData.isSubmitTriggered &&
                  !newData.form.confirmPassword.trim()) ||
                (newData.form.confirmPassword.trim() &&
                  newData.form.password !== newData.form.confirmPassword)
              }
            />
            </Stack>
          </Card.Body>
          <Card.Footer>
            <HStack ml="auto" gap={3}>
              <Button
                asChild
                variant="outline"
                colorPalette="red"
                disabled={mutationLoading}
              >
                <Link href={Pages.INDEX}>
                  <Icon name="cancel" />
                  Cancel
                </Link>
              </Button>
              <Button
                type="submit"
                colorPalette="brand"
                loading={mutationLoading}
              >
                <Icon name="register" light />
                Register
              </Button>
            </HStack>
          </Card.Footer>
        </form>
      </Card.Root>
    </Box>
  );
};

export default Register;
