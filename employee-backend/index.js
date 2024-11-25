
const express = require('express'); 
const app = express();

const admin = require('firebase-admin');
const credentials = require('./keys.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = admin.firestore();
app.post('/login', async (req, res) => {
  try {
    const { email, idToken, uid } = req.body;

    if (!idToken) {
      return res.status(400).send({ message: 'ID token is required.' });
    }

    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Ensure the UID matches the one sent by the frontend
    if (decodedToken.uid !== uid) {
      return res.status(401).send({ message: 'Invalid token or user mismatch' });
    }

    // If the token is valid and user is authenticated, proceed
    return res.status(200).send({ message: 'Login successful!', idToken, uid });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).send({ message: 'Failed to authenticate user' });
  }
});

// Route to create a user and upload an image as Base64
app.post('/create', async (req, res) => {
  try {
    console.log(req.body);

    // Destructure fields from the request body
    const { email, firstName, lastName, imageBase64 } = req.body;

    // If imageBase64 is provided, validate it (optional)
    if (imageBase64 && !imageBase64.startsWith('data:image')) {
      return res.status(400).send({ error: 'Invalid Base64 image data' });
    }

    // Prepare user data to save to Firestore
    const userJson = {
      email,
      firstName,
      lastName,
      image: imageBase64 || null, // Store the Base64 image data or null if no image
    };

    // Save to Firestore
    const response = await db.collection('users').add(userJson);

    res.status(201).send({ message: 'User created successfully', id: response.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send({ error: 'Failed to create user' });
  }
});

// Route to read all users
app.get('/read/all', async (req, res) => {
  try {
    const userRef = db.collection('users');
    const snapshot = await userRef.get();

    if (snapshot.empty) {
      return res.status(404).send({ message: 'No users found' });
    }

    let responseArr = [];
    snapshot.forEach(doc => {
      responseArr.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).send(responseArr);
  } catch (error) {
    console.error('Error reading users:', error);
    res.status(500).send({ error: 'Failed to fetch users' });
  }
});

// Route to read a user by ID
app.get('/read/:id', async (req, res) => {
  try {
    const id = req.params.id; // Get the document ID from the route parameter
    const userDoc = await db.collection('users').doc(id).get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: `User with ID ${id} not found` });
    }

    res.status(200).send({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send({ error: 'Failed to fetch user' });
  }
});

// Route to update a user by ID (including image)
app.post('/update', async (req, res) => {
  try {
    const id = req.body.id; // The document ID to update
    const { email, firstName, lastName, imageBase64 } = req.body;

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
      return res.status(404).send({ message: `User with ID ${id} not found` });
    }

    await userRef.update(updates);

    res.status(200).send({ message: 'User updated successfully', id });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send({ error: 'Failed to update user' });
  }
});

// Route to delete a user by ID
app.delete('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id; // Get the document ID from the route parameter

    const userRef = db.collection('users').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: `User with ID ${id} not found` });
    }

    await userRef.delete();

    res.status(200).send({ message: 'User deleted successfully', id });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ error: 'Failed to delete user' });
  }
});

// Server setup
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
