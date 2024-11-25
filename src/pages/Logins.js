import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [firebaseConfig, setFirebaseConfig] = useState(null);

  useEffect(() => {
    // Fetch Firebase config from keys.json
    const fetchConfig = async () => {
      const response = await fetch('/keys.json');
      const config = await response.json();
      setFirebaseConfig(config);
    };

    fetchConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firebaseConfig) {
      setMessage('Firebase configuration is missing.');
      return;
    }

    try {
      // Initialize Firebase with config from keys.json
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);  // Initialize Auth with the app instance
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      // Send the ID token to your backend
     // eslint-disable-next-line
const response = await axios.post('http://localhost:8080/login', {
  email,
  idToken,
  uid: user.uid
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
