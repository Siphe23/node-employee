import { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeForm = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    employeeId: '',
    gender: '',
    image: '', // Initialize with an empty string
    editMode: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        console.error('Failed to fetch employees:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { employeeId, name, position, email, phone, gender, image } = formData;

    const employeeData = {
      employeeId,
      name,
      email,
      phone,
      position,
      gender,
      image, // Send the Base64 image string
    };

    try {
      const response = await fetch(`http://localhost:8000/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Employee updated successfully');
        fetchEmployees(); // Refresh the list of employees after update
      } else {
        console.error('Failed to save employee:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error occurred:', error.message);
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      const response = await fetch(`http://localhost:8000/employees/${employeeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEmployees((prev) => prev.filter((employee) => employee.employeeId !== employeeId));
      } else {
        console.error('Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  return (
    <div>
      <h1>Employee Management</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
        <input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleInputChange} required />
        <input name="phone" placeholder="Phone" type="text" value={formData.phone} onChange={handleInputChange} required />
        <input name="position" placeholder="Position" value={formData.position} onChange={handleInputChange} required />
        <input name="employeeId" placeholder="Employee ID" value={formData.employeeId} onChange={handleInputChange} required />
        <input name="gender" placeholder="Gender" value={formData.gender} onChange={handleInputChange} required />
        
        {/* Handle Image Upload */}
        <input name="image" type="file" accept="image/*" onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.files[0] }))} />
        <button type="submit">Save Employee</button>
      </form>

      {/* Employee List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {employees.filter(employee => employee.name.toLowerCase().includes(searchTerm.toLowerCase())).map((employee) => (
            <li key={employee.employeeId}>
              <img src={employee.image} alt="Employee" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
              <div>
                <p>{employee.name}</p>
                <p>{employee.position}</p>
                <button onClick={() => deleteEmployee(employee.employeeId)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployeeForm;
