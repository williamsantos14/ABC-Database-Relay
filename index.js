const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// This connects to your Aiven Database
const db = mysql.createConnection("mysql://avnadmin:AVNS_BDoxs3dTr7ysaWg9ZCy@mysql-831b527-williamgunner10-32e4.f.aivencloud.com:22409/defaultdb?sslmode=required");

app.get('/instructors', (req, res) => {
    db.query("SELECT Name FROM Instructor", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results.map(r => r.Name));
    });
});

// A simple test to make sure it works
app.get('/', (req, res) => res.send("Relay is Active!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
