const express = require('express'); 
const app = express();
const cors = require('cors');
app.use(cors());

const admin = require('firebase-admin');
const credentials = require('./key.json.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = admin.firestore();

// Standard error response format
const sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).send({ error: message });
};

// Route for login
app.post('/login', async (req, res) => {
  try {
    const { email, idToken, uid } = req.body;

    if (!idToken) {
      return sendError(res, 'ID token is required.', 400);
    }

    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Ensure the UID matches the one sent by the frontend
    if (decodedToken.uid !== uid) {
      return sendError(res, 'Invalid token or user mismatch', 401);
    }

    return res.status(200).send({ message: 'Login successful!', idToken, uid });
  } catch (error) {
    console.error('Error authenticating user:', error);
    sendError(res, 'Failed to authenticate user');
  }
});

// Route to create a user and upload an image as Base64
app.post('/employees', async (req, res) => {
  try {
    const { email, firstName, lastName, imageBase64 } = req.body;

    if (!email || !firstName || !lastName) {
      return sendError(res, 'Email, first name, and last name are required.');
    }

    // Optional image validation
    if (imageBase64 && !imageBase64.startsWith('data:image')) {
      return sendError(res, 'Invalid Base64 image data.');
    }

    const employees = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      imageBase64: imageBase64 || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('employees').add(employees);
    res.status(201).send({ message: 'User created successfully', id: docRef.id });
  } catch (error) {
    console.error('Error creating user:', error);
    sendError(res, 'Failed to create user');
  }
});
app.get('/employees', async (req, res) => {
  try {
    const snapshot = await db.collection('employees').get();

    if (snapshot.empty) {
      return res.status(404).send({ message: 'No employees found' });
    }

    const employees = [];
    snapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).send(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).send({ error: 'Failed to fetch employees' });
  }
});


// Route to read all users
app.get('/read/all', async (req, res) => {
  try {
    const snapshot = await db.collection('employees').get();

    if (snapshot.empty) {
      return sendError(res, 'No employees found', 404);
    }

    const responseArr = [];
    snapshot.forEach(doc => {
      responseArr.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).send(responseArr);
  } catch (error) {
    console.error('Error reading employees:', error);
    sendError(res, 'Failed to fetch employees');
  }
});


// Route to update a user by ID (including image)
app.post('/update', async (req, res) => {
  try {
    const id = req.body.id; // The document ID to update
    const { email, firstName, lastName, imageBase64 } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return sendError(res, 'Email, first name, and last name are required.');
    }

    // Prepare updates for the user
    const updates = {
      email,
      firstName,
      lastName,
      image: imageBase64 || null, // Update the image as Base64 or null
    };

    const userRef = db.collection('users').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return sendError(res, `User with ID ${id} not found`, 404);
    }

    await userRef.update(updates);

    res.status(200).send({ message: 'User updated successfully', id });
  } catch (error) {
    console.error('Error updating user:', error);
    sendError(res, 'Failed to update user');
  }
});

// Route to delete a user by ID
app.delete('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id; // Get the document ID from the route parameter

    const userRef = db.collection('users').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return sendError(res, `User with ID ${id} not found`, 404);
    }

    await userRef.delete();

    res.status(200).send({ message: 'User deleted successfully', id });
  } catch (error) {
    console.error('Error deleting user:', error);
    sendError(res, 'Failed to delete user');
  }
});

// Server setup
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
