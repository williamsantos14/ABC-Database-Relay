const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
// Ensure you keep your actual password/host here!
const db = mysql.createConnection("mysql://avnadmin:AVNS_BDoxs3dTr7ysaWg9ZCy@mysql-831b527-williamgunner10-32e4.f.aivencloud.com:22409/defaultdb?sslmode=required");

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to Aiven MySQL.');
});

// --- GETTERS (Loading data into App) ---
app.get('/instructors', (req, res) => {
    db.query("SELECT Name FROM Instructor", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results.map(r => r.Name));
    });
});

// --- POSTERS (Saving data from App) ---

app.post('/add-student', (req, res) => {
    const { name, phase } = req.body;
    db.query("INSERT INTO Student (Name, Phase) VALUES(?, ?)", [name, phase], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).send("Student added");
    });
});

app.post('/add-instructor', (req, res) => {
    const { name } = req.body;
    db.query("INSERT INTO Instructor (Name) VALUES (?)", [name], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).send("Instructor added");
    });
});

app.post('/add-session', (req, res) => {
    const { studentID, instructor, date, phase } = req.body;
    db.query("INSERT INTO Session (StudentID, Instructor, Date, Phase) VALUES(?, ?, ?, ?)", 
    [studentID, instructor, date, phase], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).send("Session added");
    });
});

// --- PHASE UPDATES ---

app.post('/add-phase1', (req, res) => {
    const { sessionID, pickUp, reached, hand, picture, activity, released } = req.body;
    const sql = "INSERT INTO `1` (SessionID, PickedUp, Reached, Hand, Picture, Activity, Released) VALUES(?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [sessionID, pickUp, reached, hand, picture, activity, released], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).send("Phase 1 added");
    });
});

app.post('/add-phase2', (req, res) => {
    const { sessionID, travelBook, travelCP, distBook, distCP, picture, activity } = req.body;
    const sql = "INSERT INTO `2` (SessionID, `Travelled to Book`, `Travelled to CP`, `Distance to Book`, `Distance to CP`, Picture, Activity) VALUES(?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [sessionID, travelBook, travelCP, distBook, distCP, picture, activity], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).send("Phase 2 added");
    });
});

app.post('/add-phase3A', (req, res) => {
    const { sessionID, discrimination, negReaction, picture } = req.body;
    const sql = "INSERT INTO `3A` (SessionID, `Discrimination Level`, `Negative Reaction`, Picture) VALUES(?, ?, ?, ?)";
    db.query(sql, [sessionID, discrimination, negReaction, picture], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).send("Phase 3A added");
    });
});

app.post('/add-phase3B', (req, res) => {
    const { sessionID, arraySize, correspondence, distBook, distCP, picture, activity } = req.body;
    const sql = "INSERT INTO `3B` (SessionID, `Array Size`, Correspondence, `Book Distance`, `CP Distance`, Picture, Activity) VALUES(?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [sessionID, arraySize, correspondence, distBook, distCP, picture, activity], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).send("Phase 3B added");
    });
});

app.post('/add-phase4', (req, res) => {
    const { sessionID, sentenceStrip, recPicture, exchange, tapRead, correspondence, vocalizes, distCP, distBook } = req.body;
    const sql = "INSERT INTO `4` (SessionID, `Want Sentence Strip`, `Recommended Picture`, ExchangeStrip, `Tap Read`, Correspondence, Vocalizes, `Distance to CP`, `Distance to Book`) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [sessionID, sentenceStrip, recPicture, exchange, tapRead, correspondence, vocalizes, distCP, distBook], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).send("Phase 4 added");
    });
});

app.post('/add-phase5', (req, res) => {
    const { sessionID, delay, correctAns, beatPrompt, spontaneous, correspondence } = req.body;
    const sql = "INSERT INTO `5` (SessionID, `Delay Interval`, `Correct Answer`, `Beat Prompt`, Spontaneous, Correspondence) VALUES(?, ?, ?, ?, ?, ?)";
    db.query(sql, [sessionID, delay, correctAns, beatPrompt, spontaneous, correspondence], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).send("Phase 5 added");
    });
});

app.post('/add-phase6', (req, res) => {
    const { sessionID, sentenceStarter, spontaneous, independence, picture } = req.body;
    const sql = "INSERT INTO `6` (SessionID, `Sentence Starter`, Spontaneous, Independence, Picture) VALUES(?,?,?,?)";
    db.query(sql, [sessionID, sentenceStarter, spontaneous, independence, picture], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).send("Phase 6 added");
    });
});

// --- UTILITY METHODS ---

app.post('/remove-last-action', (req, res) => {
    const { table, sessionID } = req.body;
    const sql = `DELETE FROM \`${table}\` WHERE ActionID = (SELECT max_id FROM (SELECT MAX(ActionID) as max_id FROM \`${table}\` WHERE SessionID = ?) as temp)`;
    db.query(sql, [sessionID], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).send("Last action removed");
    });
});

app.post('/update-student-phase', (req, res) => {
    const { studentID, newPhase } = req.body;
    db.query("UPDATE Student SET Phase = ? WHERE StudentID = ?", [newPhase, studentID], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).send("Phase updated");
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Relay Server is live on port ${PORT}`);
});
