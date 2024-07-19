const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'runexeat'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('MYSQL Connected...');
  }
});

// Signup Endpoint
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users(name, email, password) VALUES (?, ?, ?)";
    const values = [name, email, hashedPassword];
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ error: "Error registering user" });
      }
      return res.status(200).json({ success: true, message: "User created successfully" });
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Signin Endpoint
app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  console.log('Received signin request:', { email, password }); 
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: "Error fetching user" });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: "No user found with this email" });
    }

    // Comparing the password
    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password); 
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Incorrect username or password" });
    }
    console.log('User signed in successfully');
    return res.status(200).json({ success: true, message: "User signed in successfully" });
  });
});

// Endpoint to handle Exeat form submission
app.post('/submit-exeat', (req, res) => {
  const { name, matricNumber, department, level, destination, reason, returnTime, parentPhone } = req.body;
  const sql = "INSERT INTO exeat_requests (name, matricNumber, department, level, destination, reason, returnTime, type, parentPhone, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'exeat', ?,'pending')";
  const values = [name, matricNumber, department, level, destination, reason, returnTime, parentPhone];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error submitting request:', err);
      return res.status(500).json({ error: "Error submitting request" });
    }
    return res.status(200).json({ success: true, message: "Request submitted successfully" });
  });
});


// Endpoint to handle Vacation  form submission
app.post('/submit-vacation', (req, res) => {
  const { name, matricNumber , department ,  level  } = req.body;
  const sql = "INSERT INTO vacation_requests (name , matric_number , department , level , status) VALUES (?, ?, ?, ?, 'pending')";
  const values = [name, matricNumber ,  department   , level];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error submitting request:', err);
      return res.status(500).json({ error: "Error submitting request" });
    }
    return res.status(200).json({ success: true, message: "Request submitted successfully" });
  });
});



// Endpoint to fetch pending requests for exeat requests
app.get('/pending-requests', (req, res) => {
  const sql = "SELECT * FROM exeat_requests WHERE status = 'pending'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching requests:', err);
      return res.status(500).json({ error: "Error fetching requests" });
    }
    return res.status(200).json(results);
  });
});

// Endpoint to fetch approved requests for exeat requests
app.get('/approved-requests', (req, res) => {
  const sql = "SELECT * FROM exeat_requests WHERE status = 'approved'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching requests:', err);
      return res.status(500).json({ error: "Error fetching requests" });
    }
    return res.status(200).json(results);
  });
});

// Endpoint to fetch rejected requests for exeat requests
app.get('/rejected-requests', (req, res) => {
  const sql = "SELECT * FROM exeat_requests WHERE status = 'rejected'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching requests:', err);
      return res.status(500).json({ error: "Error fetching requests" });
    }
    return res.status(200).json(results);
  });
});

// Endpoint to approve a request for exeat requests
app.post('/approve-request/:id', (req, res) => {
  const requestId = req.params.id;
  const sql = "UPDATE exeat_requests SET status = 'approved' WHERE id = ?";
  db.query(sql, [requestId], (err, result) => {
    if (err) {
      console.error('Error approving request:', err);
      return res.status(500).json({ error: "Error approving request" });
    }
    return res.status(200).json({ success: true, message: "Request approved successfully" });
  });
});

// Endpoint to reject a request for exeat requests
app.post('/reject-request/:id', (req, res) => {
  const requestId = req.params.id;
  const sql = "UPDATE exeat_requests SET status = 'rejected' WHERE id = ?";
  db.query(sql, [requestId], (err, result) => {
    if (err) {
      console.error('Error rejecting request:', err);
      return res.status(500).json({ error: "Error rejecting request" });
    }
    return res.status(200).json({ success: true, message: "Request rejected successfully" });
  });
});




// Endpoint to fetch pending requests for vacation requests
app.get('/pending-vacation', (req, res) => {
  const sql = "SELECT * FROM vacation_requests WHERE status = 'pending'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching requests:', err);
      return res.status(500).json({ error: "Error fetching requests" });
    }
    return res.status(200).json(results);
  });
});

// Endpoint to fetch approved requests for vacation requests 
app.get('/approved-vacation', (req, res) => {
  const sql = "SELECT * FROM vacation_requests WHERE status = 'approved'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching requests:', err);
      return res.status(500).json({ error: "Error fetching requests" });
    }
    return res.status(200).json(results);
  });
});



// Endpoint to fetch rejected requests for vacation requests
app.get('/rejected-vacation', (req, res) => {
  const sql = "SELECT * FROM vacation_requests WHERE status = 'rejected'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching requests:', err);
      return res.status(500).json({ error: "Error fetching requests" });
    }
    return res.status(200).json(results);
  });
});


// Endpoint to reject a request for exeat requests
app.post('/reject-request/:id', (req, res) => {
  const requestId = req.params.id;
  const sql = "UPDATE vacation_requests SET status = 'rejected' WHERE id = ?";
  db.query(sql, [requestId], (err, result) => {
    if (err) {
      console.error('Error rejecting request:', err);
      return res.status(500).json({ error: "Error rejecting request" });
    }
    return res.status(200).json({ success: true, message: "Request rejected successfully" });
  });
});


// Endpoint to reject a request for vacation requests
app.post('/reject-request/:id', (req, res) => {
  const requestId = req.params.id;
  const sql = "UPDATE vacation_requests SET status = 'rejected' WHERE id = ?";
  db.query(sql, [requestId], (err, result) => {
    if (err) {
      console.error('Error rejecting request:', err);
      return res.status(500).json({ error: "Error rejecting request" });
    }
    return res.status(200).json({ success: true, message: "Request rejected successfully" });
  });
});



// Port Address
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


