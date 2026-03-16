const express = require('express');
const mysql = require('mysql2/promise'); // Critical: use the promise version
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION CONFIG ---
const dbConfig = {
    host: "mysql-831b527-williamgunner10-32e4.f.aivencloud.com",
    port: 22409,
    user: "avnadmin",
    password: "AVNS_BDoxs3dTr7ysaWg9ZCy", // Replace with your real password
    database: "defaultdb",
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create a connection pool (highly recommended for web servers)
const pool = mysql.createPool(dbConfig);

// --- GETTERS (Loading data into App) ---

app.get('/instructors', async (req, res) => {
    try {
        const [results] = await pool.query("SELECT Name FROM Instructor");
        res.json(results.map(r => r.Name));
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- POSTERS (Saving data from App) ---

app.post('/add-student', async (req, res) => {
    const { name, phase } = req.body;
    try {
        await pool.query("INSERT INTO Student (Name, Phase) VALUES(?, ?)", [name, phase]);
        res.status(200).send("Student added");
    } catch (err) {
        res.status(500).json(err);
    }
});

app.post('/add-instructor', async (req, res) => {
    const { name } = req.body;
    try {
        await pool.query("INSERT INTO Instructor (Name) VALUES (?)", [name]);
        res.status(200).send("Instructor added");
    } catch (err) {
        res.status(500).json(err);
    }
});

app.post('/add-session', async (req, res) => {
    const { studentID, instructor, date, phase } = req.body;
    try {
        await pool.query("INSERT INTO Session (StudentID, Instructor, Date, Phase) VALUES(?, ?, ?, ?)", 
        [studentID, instructor, date, phase]);
        res.status(200).send("Session added");
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- PHASE UPDATES ---

app.post('/add-phase1', async (req, res) => {
    const { sessionID, pickUp, reached, hand, picture, activity, released } = req.body;
    const sql = "INSERT INTO `1` (SessionID, PickedUp, Reached, Hand, Picture, Activity, Released) VALUES(?, ?, ?, ?, ?, ?, ?)";
    try {
        await pool.query(sql, [sessionID, pickUp, reached, hand, picture, activity, released]);
        res.status(200).send("Phase 1 added");
    } catch (err) {
        res.status(500).json(err);
    }
});

app.post('/add-phase2', async (req, res) => {
    const { sessionID, travelBook, travelCP, distBook, distCP, picture, activity } = req.body;
    const sql = "INSERT INTO `2` (SessionID, `Travelled to Book`, `Travelled to CP`, `Distance to Book`, `Distance to CP`, Picture, Activity) VALUES(?, ?, ?, ?, ?, ?, ?)";
    try {
        await pool.query(sql, [sessionID, travelBook, travelCP, distBook, distCP, picture, activity]);
        res.status(200).send("Phase 2 added");
    } catch (err) {
        res.status(500).json(err);
    }
});

app.post('/add-phase3A', async (req, res) => {
    const { sessionID, discrimination, negReaction, picture } = req.body;
    const sql = "INSERT INTO `3A` (SessionID, `Discrimination Level`, `Negative Reaction`, Picture) VALUES(?, ?, ?, ?)";
    try {
        await pool.query(sql, [sessionID, discrimination, negReaction, picture]);
        res.status(200).send("Phase 3A added");
    } catch (err) {
        res.status(500).json(err);
    }
});

app.post('/add-phase3B', async (req, res) => {
    const { sessionID, arraySize, correspondence, distBook, distCP, picture, activity } = req.body;
    const sql = "INSERT INTO `3B` (SessionID, `Array Size`, Correspondence, `Book Distance`, `CP Distance`, Picture, Activity) VALUES(?, ?, ?, ?, ?, ?, ?)";
    try {
        await pool.query(sql, [sessionID, arraySize, correspondence, distBook, distCP, picture, activity]);
        res.status(200).send("Phase 3B added");
    } catch (err) {
        res.status(500).json(err);
    }
});

app.post('/add-phase4', async (req, res) => {
    const { sessionID, sentenceStrip, recPicture, exchange, tapRead, correspondence, vocalizes, distCP, distBook } = req.body;
    const sql = "INSERT INTO `4` (SessionID, `Want Sentence Strip`, `Recommended Picture`, ExchangeStrip, `Tap Read`, Correspondence, Vocalizes, `Distance to CP`, `Distance to Book`) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";
    try {
        await pool.query(sql, [sessionID, sentenceStrip, recPicture, exchange, tapRead, correspondence, vocalizes, distCP, distBook]);
        res.status(200).send("Phase 4 added");
    } catch (err) {
        res.status(500).json(err);
    }
});

app.post('/add-phase5', async (req, res) => {
    const { sessionID, delay, correctAns, beatPrompt, spontaneous, correspondence } = req.body;
    const sql = "INSERT INTO `5` (SessionID, `Delay Interval`, `Correct Answer`, `Beat Prompt`, Spontaneous, Correspondence) VALUES(?, ?, ?, ?, ?, ?)";
    try {
        await pool.query(sql, [sessionID, delay, correctAns, beatPrompt, spontaneous, correspondence]);
        res.status(200).send("Phase 5 added");
    } catch (err) {
        res.status(500).json(err);
    }
});

app.post('/add-phase6', async (req, res) => {
    const { sessionID, sentenceStarter, spontaneous, independence, picture } = req.body;
    const sql = "INSERT INTO `6` (SessionID, `Sentence Starter`, Spontaneous, Independence, Picture) VALUES(?,?,?,?)";
    try {
        await pool.query(sql, [sessionID, sentenceStarter, spontaneous, independence, picture]);
        res.status(200).send("Phase 6 added");
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- UTILITY METHODS ---

app.post('/remove-last-action', async (req, res) => {
    const { table, sessionID } = req.body;
    const sql = `DELETE FROM \`${table}\` WHERE ActionID = (SELECT max_id FROM (SELECT MAX(ActionID) as max_id FROM \`${table}\` WHERE SessionID = ?) as temp)`;
    try {
        await pool.query(sql, [sessionID]);
        res.status(200).send("Last action removed");
    } catch (err) {
        res.status(500).json(err);
    }
});

app.post('/update-student-phase', async (req, res) => {
    const { studentID, newPhase } = req.body;
    try {
        await pool.query("UPDATE Student SET Phase = ? WHERE StudentID = ?", [newPhase, studentID]);
        res.status(200).send("Phase updated");
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/fetch-all-data', async (req, res) => {
    try {
        const [instructors] = await pool.query("SELECT Name FROM Instructor");
        const [students] = await pool.query("SELECT Name, Phase, StudentID FROM Student");

        for (let student of students) {
            const [sessions] = await pool.query(
                "SELECT Instructor, SessionID, Date, Phase FROM Session WHERE StudentID = ?", 
                [student.StudentID]
            );

            for (let session of sessions) {
                const [actions] = await pool.query(`SELECT * FROM \`${session.Phase}\` WHERE SessionID = ?`, [session.SessionID]);
                session.actions = actions;
            }
            student.sessions = sessions;
        }

        res.json({
            instructors: instructors.map(i => i.Name),
            students: students
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Relay Server is live on port ${PORT}`);
});
