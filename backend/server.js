const { MongoClient } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

const url = process.env.MONGO_URI || 'mongodb://localhost:27017'; // MongoDB URI
const dbName = 'password-op'; // Database name

const client = new MongoClient(url);

client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
    });

app.use(bodyParser.json());
app.use(cors());

// GET all passwords
app.get('/', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('documents');
        const passwords = await collection.find({}).toArray();
        res.json(passwords);
    } catch (error) {
        console.error('Error fetching passwords:', error);
        res.status(500).json({ message: 'Error fetching passwords' });
    }
});

// POST a new password
app.post('/', async (req, res) => {
    const password = req.body;
    try {
        const db = client.db(dbName);
        const collection = db.collection('documents');
        const result = await collection.insertOne(password);
        res.json({ success: true, result });
    } catch (error) {
        console.error('Error saving password:', error);
        res.status(500).json({ message: 'Error saving password' });
    }
});

// PUT to update an existing password
app.put('/password', async (req, res) => {
    const { site, username, password } = req.body;

    if (!site || !username || !password) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    console.log('Received PUT request to update password:', { site, username, password });

    try {
        const db = client.db(dbName);
        const collection = db.collection('documents');

        // Find and update the password
        const result = await collection.updateOne(
            { site: site, username: username }, // Find the document by site and username
            { $set: { password: password } } // Update the password field
        );

        console.log('MongoDB update result:', result);

        if (result.modifiedCount === 0) {
            return res.status(400).json({ message: 'Password not found or not updated' });
        }

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Error updating password' });
    }
});

// DELETE a password
app.delete('/', async (req, res) => {
    const { site, username } = req.body;

    if (!site || !username) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    try {
        const db = client.db(dbName);
        const collection = db.collection('documents');
        const result = await collection.deleteOne({ site: site, username: username });

        if (result.deletedCount === 1) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(404).json({ success: false, message: 'Password not found' });
        }
    } catch (error) {
        console.error('Error deleting password:', error);
        res.status(500).json({ message: 'Error deleting password' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
