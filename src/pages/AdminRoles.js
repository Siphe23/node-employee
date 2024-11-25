import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminRoles = () => {
  const [adminRoles, setAdminRoles] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    surname: '',
    age: '',
    idNumber: '',
    phoneNumber: '',
    email: '',
    password: '',
    image: null, // Store the image file directly
  });
  const [previewImage, setPreviewImage] = useState(null); // For image preview

  const API_BASE_URL = 'http://localhost:8080/create'; // Adjust based on your server

  // Fetch Admin Roles
  useEffect(() => {
    axios.get('http://localhost:8080/read/all')
      .then((response) => setAdminRoles(response.data))
      .catch((error) => console.error('Error fetching admin roles:', error));
  }, []);

  // Handle Form Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAdmin((prev) => ({ ...prev, image: file })); // Store the file itself
        setPreviewImage(reader.result); // Update preview
      };
      reader.readAsDataURL(file);
    }
  };

  // Add New Admin
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newAdmin.name);
    formData.append('surname', newAdmin.surname);
    formData.append('age', newAdmin.age);
    formData.append('idNumber', newAdmin.idNumber);
    formData.append('phoneNumber', newAdmin.phoneNumber);
    formData.append('email', newAdmin.email);
    formData.append('password', newAdmin.password);
    formData.append('image', newAdmin.image); // Append image file

    axios.post(API_BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((response) => {
        alert('Admin role created successfully!');
        setAdminRoles((prev) => [...prev, { id: response.data.id, ...newAdmin }]);
        setNewAdmin({
          name: '',
          surname: '',
          age: '',
          idNumber: '',
          phoneNumber: '',
          email: '',
          password: '',
          image: null,
        });
        setPreviewImage(null);
      })
      .catch((error) => {
        console.error('Error creating admin role:', error);
      });
  };

  // Delete Admin
  const handleDelete = (id) => {
    axios.delete(`${API_BASE_URL}/delete/${id}`)
      .then(() => {
        setAdminRoles((prev) => prev.filter((admin) => admin.id !== id));
        alert('Admin role deleted successfully!');
      })
      .catch((error) => console.error('Error deleting admin role:', error));
  };

  return (
    <div>
      <h1>Admin Roles</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={newAdmin.name} onChange={handleChange} required />
        <input name="surname" placeholder="Surname" value={newAdmin.surname} onChange={handleChange} required />
        <input name="age" placeholder="Age" type="number" value={newAdmin.age} onChange={handleChange} required />
        <input name="idNumber" placeholder="ID Number" value={newAdmin.idNumber} onChange={handleChange} required />
        <input name="phoneNumber" placeholder="Phone Number" value={newAdmin.phoneNumber} onChange={handleChange} required />
        <input name="email" placeholder="Email" type="email" value={newAdmin.email} onChange={handleChange} required />
        <input name="password" placeholder="Password" type="password" value={newAdmin.password} onChange={handleChange} required />
        
        {/* Image Upload */}
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {previewImage && <img src={previewImage} alt="Preview" style={{ width: '100px', height: '100px', marginTop: '10px' }} />}

        <button type="submit">Add Admin</button>
      </form>

      <h2>Existing Admin Roles</h2>
      <ul>
        {adminRoles.map((admin) => (
          <li key={admin.id}>
            <img src={admin.image} alt={admin.name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
            {admin.name} {admin.surname} ({admin.email})
            <button onClick={() => handleDelete(admin.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminRoles;
