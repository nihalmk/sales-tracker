import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Logo } from '../components/Header/Logo';
import { Alert } from 'tabler-react';
import { useMutation } from '@apollo/react-hooks';
import { RESET_PASSWORD } from '../graphql/mutation/user';
import { useRouter } from 'next/router';
import { clientLogger as logger } from '../utils/logger';

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

  const getNotification = (notificationObj: Notification): JSX.Element => {
    return (
      <Alert
        id="notification"
        className="alert-align"
        type={notificationObj.type}
      >
        {notificationObj.message}
      </Alert>
    );
  };

  return (
    <div className="col col-login mx-auto">
      <div className="text-center mb-6">
        <Logo setColor />
      </div>
      <div className="card">
        <div className="card-body">
          <div className="card-title text-center">Forgot Password</div>
        </div>
        <div className="card-body p-6">
          {notification && getNotification(notification)}
          <p>
            Enter your email address to receive an email with password reset
            instructions.
          </p>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter email"
              onChange={onEmailChange}
            />
          </div>
          <div className="form-footer">
            <button
              type="button"
              onClick={sendMail}
              className={
                'btn btn-primary btn-block ' + (isLoading && 'btn-loading')
              }
            >
              Send reset email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgot;
