import React, { useState } from 'react';
import Head from 'next/head';
import Router from 'next/router';

import cookie from 'js-cookie';

const Login = () => {
  const [loginError, setLoginError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data && data.error) {
          setLoginError(data.message);
        }
        if (data && data.token) {
          cookie.set('token', data.token, { expires: 2 });
          Router.push('/');
        }
      });
  };
  return (
    <div>
      <Head>
        <title>Login</title>
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          name='email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          name='password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type='submit' value='Submit' />
        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
      </form>
    </div>
  );
};

export default Login;
