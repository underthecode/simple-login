import React, { useState } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import cookie from 'js-cookie';

const Register = () => {
  const [registerError, setRegisterError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.error) {
          setRegisterError(data.message);
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
        <title>Register</title>
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>
      <form onSubmit={handleSubmit}>
        <h2>Register</h2>
        <label htmlFor='email'>
          email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name='email'
            type='email'
          />
        </label>

        <br />

        <label htmlFor='password'>
          password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name='password'
            type='password'
          />
        </label>

        <br />

        <input type='submit' value='Submit' />
        {registerError && <p style={{ color: 'red' }}>{registerError}</p>}
      </form>
    </div>
  );
};

export default Register;
