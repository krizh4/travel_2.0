// const express = require('express');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { MongoClient } = require('mongodb');

// const app = express();
// const port = 3000;

// const url = 'mongodb://localhost:27017'; // Replace with your MongoDB connection string
// const dbName = 'your-database-name'; // Replace with your database name

// app.use(express.json());

// // Registration route
// app.post('/register', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new user document
//     const user = {
//       username,
//       password: hashedPassword,
//     };

//     // Connect to the MongoDB server
//     const client = await MongoClient.connect(url);
//     const db = client.db(dbName);

//     // Insert the user document into the collection
//     const result = await db.collection('users').insertOne(user);

//     // Close the MongoDB connection
//     client.close();

//     res.status(201).send('User registered successfully');
//   } catch (error) {
//     console.error('Error during registration:', error);
//     res.status(500).send('Internal server error');
//   }
// });

// // Login route
// app.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // Connect to the MongoDB server
//     const client = await MongoClient.connect(url);
//     const db = client.db(dbName);

//     // Find the user document by username
//     const user = await db.collection('users').findOne({ username });

//     if (!user) {
//       // User not found
//       res.status(401).send('Invalid credentials');
//     } else {
//       // Compare the provided password with the hashed password in the database
//       const passwordMatch = await bcrypt.compare(password, user.password);

//       if (passwordMatch) {
//         // Generate a JSON Web Token (JWT) for authentication
//         const token = jwt.sign({ username: user.username }, 'your-secret-key');

//         res.json({ token });
//       } else {
//         // Password does not match
//         res.status(401).send('Invalid credentials');
//       }
//     }

//     // Close the MongoDB connection
//     client.close();
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).send('Internal server error');
//   }
// });

// // Protected route
// app.get('/protected', (req, res) => {
//   // Verify the JWT token
//   const token = req.headers.authorization;

//   if (!token) {
//     res.status(401).send('Unauthorized');
//   } else {
//     try {
//       const decoded = jwt.verify(token, 'your-secret-key');
//       res.send(`Welcome, ${decoded.username}! This is a protected route.`);
//     } catch (error) {
//       console.error('Error during token verification:', error);
//       res.status(401).send('Unauthorized');
//     }
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });
