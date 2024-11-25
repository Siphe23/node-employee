function GeneralAdminForm() {
    const [adminEmail, setAdminEmail] = useState('');
    const [message, setMessage] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post('http://localhost:8080/create', {
          email: adminEmail,
          firstName: 'General',
          lastName: 'Admin',
        });
        setMessage('General Admin added successfully!');
      } catch (error) {
        setMessage('Error adding General Admin.');
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <h2>Add General Admin</h2>
        <label>Email</label>
        <input
          type="email"
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
  