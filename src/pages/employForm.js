import { useState, useEffect } from 'react';

const EmployeeForm = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    employeeId: '',
    gender: '',
    image: '', 
    editMode: false, 
  });

  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
    
     const response = await fetch('http://localhost:8080/read/all');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
        }));
      };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { employeeId, name, position, email, phone, gender, image, editMode } = formData;

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
      let response;
      if (editMode) {
        // If edit mode, update the existing employee
        response = await fetch(`http://localhost:8080/employees/${employeeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(employeeData),
        });
      } else {
        // If not in edit mode, create a new employee
        response = await fetch('http://localhost:8080/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(employeeData),
        });
      }

      const data = await response.json();
      if (response.ok) {
        console.log('Employee saved successfully');
        fetchEmployees(); // Refresh the list of employees after update or creation
        setFormData({
          name: '',
          email: '',
          phone: '',
          position: '',
          employeeId: '',
          gender: '',
          image: '',
          editMode: false, // Reset form
        });
      } else {
        console.error('Failed to save employee:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error occurred:', error.message);
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      const response = await fetch(`http://localhost:8080/employees/${employeeId}`, {
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

  const handleEdit = (employee) => {
    setFormData({
      ...employee,
      editMode: true, // Set to edit mode
    });
  };
  const addEmployee = async () => {
    const newEmployee = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      imageBase64: 'data:image/png;base64,...' // Replace with actual Base64 data
    };
  
    try {
      const response = await fetch('http://localhost:8080/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Employee added successfully:', data);
    } catch (error) {
      console.error('Error adding employee:', error);
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
        <input name="image" type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">{formData.editMode ? 'Update Employee' : 'Save Employee'}</button>
      </form>

      {/* Employee List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {employees.map((employee) => (
            <li key={employee.employeeId}>
              <img src={employee.image} alt="Employee" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
              <div>
                <p>{employee.name}</p>
                <p>{employee.position}</p>
                <button onClick={() => handleEdit(employee)}>Edit</button>
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
