import React, { useState } from 'react';
import axios from 'axios';


function GeneralAdminForm() {
  const [adminEmail, setAdminEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure email is not empty before making the request
    if (!adminEmail) {
      setMessage('Email is required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/create', {
        email: adminEmail,
        firstName: 'General',
        lastName: 'Admin',
      });

      if (response.status === 201 || response.status === 200) {
        setMessage('General Admin added successfully!');
        setAdminEmail(''); // Clear the input field
      } else {
        setMessage('Unexpected response from the server.');
      }
    } catch (error) {
      console.error('Error adding General Admin:', error);
      setMessage(
        error.response?.data?.message || 'Error adding General Admin. Please try again later.'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add General Admin</h2>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        placeholder="Enter admin email"
        value={adminEmail}
        onChange={(e) => setAdminEmail(e.target.value)}
        required
      />
      <button type="submit">Add General Admin</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default GeneralAdminForm;
