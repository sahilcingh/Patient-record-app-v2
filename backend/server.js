// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Database Connection Configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE, 
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

// --- SECURITY MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Access Denied: Invalid Token' });
        req.user = user; 
        next();
    });
};

// --- API ENDPOINT: LOGIN ---
app.post('/api/login', async (req, res) => {
    const { doctorId, password } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar, doctorId)
            .query('SELECT UserID, Username, Password, DoctorName FROM dbo.Pat_User WHERE Username = @username');

        const user = result.recordset[0];

        if (!user) return res.status(401).json({ success: false, message: 'Invalid Doctor ID' });
        if (user.Password !== password) return res.status(401).json({ success: false, message: 'Invalid Password' });

        const token = jwt.sign(
            { 
                userId: user.UserID, 
                doctorName: user.DoctorName
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' } 
        );

        res.json({ 
            success: true, 
            token: token, 
            doctorName: user.DoctorName
        });

    } catch (err) {
        console.error('Database error during login:', err);
        res.status(500).json({ success: false, message: 'Internal server error connecting to the database.' });
    }
});

// --- API ENDPOINT: SAVE NEW PATIENT VISIT ---
app.post('/api/visits', authenticateToken, async (req, res) => {
    const { 
        date, patientName, fatherName, sex, age, 
        mobile, address, chiefComplaint, medicine, 
        tests, total, cartage, conveyance, grandTotal 
    } = req.body;

    if (!patientName || !mobile) {
        return res.status(400).json({ success: false, message: 'Patient Name and Mobile are required.' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const tableName = `dbo.Pat_Master`;

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const snoRequest = new sql.Request(transaction);
            const snoResult = await snoRequest.query(`
                SELECT ISNULL(MAX(CAST(B_Sno AS INT)), 0) + 1 AS NextSno 
                FROM ${tableName}
            `);
            const nextSno = snoResult.recordset[0].NextSno;

            const insertRequest = new sql.Request(transaction);
            
            insertRequest.input('bSno', sql.Int, nextSno);
            insertRequest.input('bDate', sql.Date, date || new Date());
            insertRequest.input('bPName', sql.VarChar(100), patientName || '');
            insertRequest.input('bFName', sql.VarChar(100), fatherName || '');
            insertRequest.input('bSex', sql.VarChar(20), sex || '');
            insertRequest.input('bAge', sql.Int, parseInt(age) || 0);
            insertRequest.input('bMobile', sql.VarChar(20), mobile || '');
            insertRequest.input('bTo', sql.VarChar(255), address || '');
            
            insertRequest.input('bPerticu1', sql.VarChar(sql.MAX), chiefComplaint || '');
            insertRequest.input('bPerticu2', sql.VarChar(sql.MAX), medicine || '');
            insertRequest.input('bTests', sql.VarChar(sql.MAX), tests || '');
            
            insertRequest.input('bPerticuAmt1', sql.Decimal(10, 2), parseFloat(total) || 0.00);
            insertRequest.input('bCart', sql.Decimal(10, 2), parseFloat(cartage) || 0.00);
            insertRequest.input('bConv', sql.Decimal(10, 2), parseFloat(conveyance) || 0.00);
            insertRequest.input('bTotalAmt', sql.Decimal(10, 2), parseFloat(grandTotal) || 0.00);

            await insertRequest.query(`
                INSERT INTO ${tableName} (
                    B_Sno, B_Date, B_PName, B_FName, B_Sex, B_Age, B_Mobile, B_To, 
                    B_Perticu1, B_Perticu2, B_Tests, B_PerticuAmt1, B_Cart, B_Conv, B_TotalAmt
                ) VALUES (
                    @bSno, @bDate, @bPName, @bFName, @bSex, @bAge, @bMobile, @bTo, 
                    @bPerticu1, @bPerticu2, @bTests, @bPerticuAmt1, @bCart, @bConv, @bTotalAmt
                )
            `);

            await transaction.commit();

            res.status(201).json({ 
                success: true, 
                message: 'Patient record saved successfully.',
                visitNumber: nextSno 
            });

        } catch (transactionError) {
            await transaction.rollback();
            throw transactionError; 
        }

    } catch (err) {
        console.error('Database error saving visit:', err);
        res.status(500).json({ success: false, message: 'Failed to save patient record.' });
    }
});

// --- API ENDPOINT: SEARCH PATIENTS (Dropdown) ---
app.get('/api/patients/search', authenticateToken, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json({ success: true, results: [] });

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('query', sql.VarChar, `%${q}%`)
            .query(`
                SELECT DISTINCT 
                    B_Sno AS VisitID, 
                    B_PName AS PatientName, 
                    B_FName AS FatherName, 
                    B_Mobile AS Mobile,
                    B_Date AS VisitDate
                FROM dbo.Pat_Master
                WHERE B_PName LIKE @query OR B_Mobile LIKE @query
                ORDER BY VisitDate DESC
            `);
            
        // Sending 'results' so React knows exactly where to find the data
        res.json({ success: true, results: result.recordset });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ success: false, message: 'Search failed.' });
    }
});

// --- API ENDPOINT: GET PATIENT VISIT HISTORY (Modal) ---
app.get('/api/patients/history', authenticateToken, async (req, res) => {
    const { mobile, name } = req.query;
    
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('mobile', sql.VarChar, mobile || '')
            .input('name', sql.VarChar, name || '')
            .query(`
                SELECT 
                    B_Sno AS VisitID, 
                    B_PName AS PatientName, 
                    B_FName AS FatherName, 
                    B_Mobile AS Mobile, 
                    B_Date AS VisitDate 
                FROM dbo.Pat_Master 
                WHERE B_Mobile = @mobile OR (B_PName = @name AND (B_Mobile IS NULL OR B_Mobile = ''))
                ORDER BY CAST(B_Sno AS INT) DESC
            `);
            
        // Sending 'history' back to React
        res.json({ success: true, history: result.recordset });
    } catch (err) {
        console.error("History error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// --- API ENDPOINT: GET SINGLE VISIT DETAILS (Auto-fill Old Patient) ---
app.get('/api/patients/visit/:id', authenticateToken, async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('sno', sql.Int, req.params.id)
            .query(`SELECT * FROM dbo.Pat_Master WHERE B_Sno = @sno`);
            
        if (result.recordset.length > 0) {
            res.json({ success: true, visit: result.recordset[0] });
        } else {
            res.json({ success: false, message: 'Visit not found' });
        }
    } catch (err) {
        console.error('Fetch visit error:', err);
        res.status(500).json({ success: false });
    }
});

// --- API ENDPOINT: GET ALL PATIENTS (Master List) ---
app.get('/api/patients/all', authenticateToken, async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const tableName = `dbo.Pat_Master`;

        const result = await pool.request().query(`
            SELECT 
                B_Sno AS VisitID, 
                B_Date AS VisitDate,
                B_PName AS PatientName,
                B_Mobile AS Mobile,
                B_Sex AS Gender
            FROM ${tableName}
            ORDER BY CAST(B_Sno AS INT) DESC
        `);

        res.json({ 
            success: true, 
            patients: result.recordset 
        });

    } catch (err) {
        console.error('Database error fetching all patients:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch patients master list.' });
    }
});

// --- API ENDPOINT: GET RECENT PATIENTS ---
app.get('/api/patients/recent', authenticateToken, async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const tableName = `dbo.Pat_Master`;

        const result = await pool.request().query(`
            SELECT TOP 5
                B_Sno AS VisitID, 
                B_PName AS PatientName, 
                B_Date AS VisitDate
            FROM ${tableName}
            ORDER BY CAST(B_Sno AS INT) DESC
        `);

        res.json({ 
            success: true, 
            patients: result.recordset 
        });

    } catch (err) {
        console.error('Database error fetching recent patients:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch recent patients.' });
    }
});

// --- API ENDPOINT: REAL-TIME DASHBOARD STATS ---
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const tableName = `dbo.Pat_Master`;

        // 1. Total Patients Today
        const patientsTodayResult = await pool.request().query(`
            SELECT COUNT(*) AS count 
            FROM ${tableName} 
            WHERE CAST(B_Date AS DATE) = CAST(GETDATE() AS DATE)
        `);

        // 2. New Registrations
        const newRegistrationsResult = await pool.request().query(`
            SELECT COUNT(DISTINCT B_Mobile) AS count 
            FROM ${tableName} 
            WHERE CAST(B_Date AS DATE) = CAST(GETDATE() AS DATE) 
            AND B_Mobile NOT IN (
                SELECT B_Mobile FROM ${tableName} WHERE CAST(B_Date AS DATE) < CAST(GETDATE() AS DATE)
            )
        `);

        // 3. Tests Prescribed
        const testsPrescribedResult = await pool.request().query(`
            SELECT COUNT(*) AS count 
            FROM ${tableName} 
            WHERE CAST(B_Date AS DATE) = CAST(GETDATE() AS DATE) 
            AND B_Tests IS NOT NULL AND CAST(B_Tests AS VARCHAR(MAX)) != ''
        `);

        // 4. Daily Revenue
        const dailyRevenueResult = await pool.request().query(`
            SELECT ISNULL(SUM(B_TotalAmt), 0) AS total 
            FROM ${tableName} 
            WHERE CAST(B_Date AS DATE) = CAST(GETDATE() AS DATE)
        `);

        res.json({
            success: true,
            stats: {
                patientsToday: patientsTodayResult.recordset[0].count || 0,
                newRegistrations: newRegistrationsResult.recordset[0].count || 0,
                testsPrescribed: testsPrescribedResult.recordset[0].count || 0,
                dailyRevenue: dailyRevenueResult.recordset[0].total || 0
            }
        });

    } catch (err) {
        console.error('Database error fetching stats:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch daily stats.' });
    }
});

// Start listening for requests
app.listen(PORT, () => {
    console.log(`Backend Server running securely on http://localhost:${PORT}`);
});