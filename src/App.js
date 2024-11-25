import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/adminDashboard';  
import GeneralAdmin from './pages/generalAdmin';    
import SuperAdmin from './pages/superAdmin';         
import EmployeeForm from './pages/employForm';
import Login from './pages/Logins';
import AdminRoles from './pages/AdminRoles'; 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/add-employee" element={<EmployeeForm />} />
        <Route path="/" element={<AdminDashboard />} /> 
        <Route path="/general-admin" element={<GeneralAdmin />} />
        <Route path="/super-admin" element={<SuperAdmin />} />
        <Route path="/admin-roles" element={<AdminRoles />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
