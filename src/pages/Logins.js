import React, { useState } from 'react';
import axios from 'axios';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();



const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get the Firebase ID token
    const idToken = await user.getIdToken();

    // Send the ID token to your backend
    const response = await axios.post('http://localhost:8080/login', {
      email,
      idToken,  // Send the Firebase ID token here
      uid: user.uid  // Include the UID
    });

    setMessage('Login successful!');
    localStorage.setItem('idToken', idToken);
    localStorage.setItem('uid', user.uid);
    navigate('/dashboard');
  } catch (error) {
    setMessage(error.message || 'Login failed');
  }
};

  return (
    <div className="login-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <div>{message}</div>
    </div>
  );
}

export default Login;

