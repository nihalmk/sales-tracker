import React, { useState } from 'react';
import { NextPage } from 'next';
import { Logo } from '../../components/Header/Logo';
import { accountsPassword } from '../../../accounts/client';
import { useRouter } from 'next/router';
import cookie from 'js-cookie';

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
    <div className="col col-login mx-auto">
      <div className="text-center mb-6">
        <Logo setColor />
      </div>
      <div className="card">
        <div className="card-body">
          <div className="card-title text-center">Reset Password</div>
        </div>
        <div className="card-body p-6">
          <p>
            Enter your new password below to reset the password of your account.
          </p>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              name="password"
              type="password"
              className="form-control"
              id="password"
              placeholder="Password"
              onChange={onPasswordChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              className="form-control"
              id="confirmPassword"
              placeholder="Password"
              onChange={onConfirmPasswordChange}
            />
          </div>
          <div className="form-footer">
            <button
              type="button"
              onClick={changePassword}
              className={
                'btn btn-primary btn-block ' + (isLoading ? 'btn-loading' : '')
              }
              disabled={password === '' || password !== confirmPassword}
            >
              Reset password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reset;
