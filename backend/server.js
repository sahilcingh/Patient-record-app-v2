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

// --- API ENDPOINT: GET UNIQUE PATIENTS WITH VISIT COUNT ---
app.get('/api/patients/unique', authenticateToken, async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        
        // Groups by Mobile and Name, getting the latest visit ID and total visit count
        const result = await pool.request().query(`
            SELECT 
                B_PName AS PatientName, 
                B_Mobile AS Mobile, 
                MAX(B_Date) AS LastVisitDate,
                MAX(CAST(B_Sno AS INT)) AS LatestVisitID,
                COUNT(B_Sno) AS VisitCount
            FROM dbo.Pat_Master
            WHERE B_PName IS NOT NULL AND B_PName != ''
            GROUP BY B_PName, B_Mobile
            ORDER BY LastVisitDate DESC, LatestVisitID DESC
        `);

        res.json({ success: true, patients: result.recordset });
    } catch (err) {
        console.error('Database error fetching unique patients:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch patients list.' });
    }
});

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
                WITH RankedPatients AS (
                    SELECT 
                        B_Sno AS VisitID, 
                        B_PName AS PatientName, 
                        B_FName AS FatherName, 
                        B_Mobile AS Mobile,
                        B_Date AS VisitDate,
                        ROW_NUMBER() OVER(PARTITION BY B_Mobile ORDER BY CAST(B_Sno AS INT) DESC) as rn
                    FROM dbo.Pat_Master
                    WHERE B_PName LIKE @query OR B_Mobile LIKE @query
                )
                SELECT VisitID, PatientName, FatherName, Mobile, VisitDate
                FROM RankedPatients
                WHERE rn = 1
                ORDER BY VisitDate DESC
            `);
            
        // Sending 'results' so React knows exactly where to find the data
        res.json({ success: true, results: result.recordset });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ success: false, message: 'Search failed.' });
    }
});

// --- API ENDPOINT: DELETE A PATIENT VISIT ---
app.delete('/api/patients/visit/:id', authenticateToken, async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        
        // Execute the delete query using the ID passed in the URL
        const result = await pool.request()
            .input('sno', sql.Int, req.params.id)
            .query(`DELETE FROM dbo.Pat_Master WHERE B_Sno = @sno`);
            
        // Check if a row was actually deleted
        if (result.rowsAffected[0] > 0) {
            res.json({ success: true, message: 'Visit record deleted successfully.' });
        } else {
            res.status(404).json({ success: false, message: 'Visit not found or already deleted.' });
        }
    } catch (err) {
        console.error('Delete visit error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete the patient record.' });
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
            SELECT TOP 6
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

// --- API ENDPOINT: GET DOCTOR PROFILE ---
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        
        // We use req.user.userId from the JWT token to ensure we get the logged-in doctor
        const result = await pool.request()
            .input('userId', sql.Int, req.user.userId)
            .query(`
                SELECT Username, DoctorName, DoctorDesi, CompName, ClinicAddress, ClinicTimings
                FROM dbo.Pat_User
                WHERE UserID = @userId
            `);

        if (result.recordset.length > 0) {
            res.json({ success: true, profile: result.recordset[0] });
        } else {
            res.status(404).json({ success: false, message: 'Profile not found' });
        }
    } catch (err) {
        console.error('Database error fetching profile:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch profile data.' });
    }
});

// --- API ENDPOINT: UPDATE DOCTOR PROFILE ---
app.put('/api/profile', authenticateToken, async (req, res) => {
    // These names match the formData object in your React frontend
    const { username, password, doctorName, designation, clinicName, clinicAddress, clinicTimings } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const request = pool.request();
        
        request.input('userId', sql.Int, req.user.userId);
        request.input('username', sql.VarChar, username || '');
        request.input('doctorName', sql.VarChar, doctorName || '');
        request.input('doctorDesi', sql.VarChar, designation || ''); // Maps to DoctorDesi
        request.input('compName', sql.VarChar, clinicName || '');    // Maps to CompName
        request.input('clinicAddress', sql.VarChar, clinicAddress || '');
        request.input('clinicTimings', sql.VarChar, clinicTimings || '');

        // Base update query
        let query = `
            UPDATE dbo.Pat_User
            SET Username = @username,
                DoctorName = @doctorName,
                DoctorDesi = @doctorDesi,
                CompName = @compName,
                ClinicAddress = @clinicAddress,
                ClinicTimings = @clinicTimings
        `;

        // Only update the password if the user actually typed a new one
        if (password && password.trim() !== '') {
            request.input('password', sql.VarChar, password);
            query += `, Password = @password`;
        }

        query += ` WHERE UserID = @userId`;

        await request.query(query);

        res.json({ success: true, message: 'Profile updated successfully!' });
    } catch (err) {
        console.error('Database error updating profile:', err);
        res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
});

// --- API ENDPOINT: GET DASHBOARD STATS & TRENDS ---
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        
        // This query securely fetches all the time-based data we need for math
        const result = await pool.request().query(`
            DECLARE @Today DATE = CAST(GETDATE() AS DATE);
            DECLARE @Yesterday DATE = DATEADD(day, -1, @Today);
            DECLARE @WeekStart DATE = DATEADD(day, -7, @Today);
            DECLARE @LastWeekStart DATE = DATEADD(day, -14, @Today);
            DECLARE @MonthStart DATE = DATEADD(day, 1-DAY(@Today), @Today);
            DECLARE @LastMonthStart DATE = DATEADD(month, -1, @MonthStart);

            SELECT 
                -- 1. Patients Today vs Yesterday
                (SELECT COUNT(*) FROM dbo.Pat_Master WHERE CAST(B_Date AS DATE) = @Today) AS PatientsToday,
                (SELECT COUNT(*) FROM dbo.Pat_Master WHERE CAST(B_Date AS DATE) = @Yesterday) AS PatientsYesterday,
                
                -- 2. New Registrations This Week vs Last Week
                (SELECT COUNT(*) FROM dbo.Pat_Master WHERE CAST(B_Date AS DATE) >= @WeekStart) AS RegThisWeek,
                (SELECT COUNT(*) FROM dbo.Pat_Master WHERE CAST(B_Date AS DATE) >= @LastWeekStart AND CAST(B_Date AS DATE) < @WeekStart) AS RegLastWeek,
                
                -- 3. Tests Prescribed This Week vs Last Week
                (SELECT COUNT(*) FROM dbo.Pat_Master WHERE CAST(B_Date AS DATE) >= @WeekStart AND B_Tests IS NOT NULL AND DATALENGTH(B_Tests) > 0) AS TestsThisWeek,
                (SELECT COUNT(*) FROM dbo.Pat_Master WHERE CAST(B_Date AS DATE) >= @LastWeekStart AND CAST(B_Date AS DATE) < @WeekStart AND B_Tests IS NOT NULL AND DATALENGTH(B_Tests) > 0) AS TestsLastWeek,
                
                -- 4. Revenue Today & This Month vs Last Month
                ISNULL((SELECT SUM(B_TotalAmt) FROM dbo.Pat_Master WHERE CAST(B_Date AS DATE) = @Today), 0) AS RevToday,
                ISNULL((SELECT SUM(B_TotalAmt) FROM dbo.Pat_Master WHERE CAST(B_Date AS DATE) >= @MonthStart), 0) AS RevThisMonth,
                ISNULL((SELECT SUM(B_TotalAmt) FROM dbo.Pat_Master WHERE CAST(B_Date AS DATE) >= @LastMonthStart AND CAST(B_Date AS DATE) < @MonthStart), 0) AS RevLastMonth
        `);

        const data = result.recordset[0];

        // --- SAFE MATH HELPER ---
        // Prevents dividing by zero if there was no data in the previous period
        const calcTrend = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0; 
            return (((current - previous) / previous) * 100).toFixed(1);
        };

        // Send the formatted stats and calculated trends to the frontend
        res.json({
            success: true,
            stats: {
                patientsToday: data.PatientsToday,
                patientsTrend: calcTrend(data.PatientsToday, data.PatientsYesterday),
                
                newRegistrations: data.RegThisWeek,
                registrationsTrend: calcTrend(data.RegThisWeek, data.RegLastWeek),
                
                testsPrescribed: data.TestsThisWeek,
                testsTrend: calcTrend(data.TestsThisWeek, data.TestsLastWeek),
                
                dailyRevenue: data.RevToday,
                revenueTrend: calcTrend(data.RevThisMonth, data.RevLastMonth)
            }
        });

    } catch (err) {
        console.error('Database error fetching stats:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.' });
    }
});
// --- HEALTH CHECK ROUTE (Keeps the server awake) ---
app.get('/', (req, res) => {
    res.status(200).send('Backend is awake and running!');
});
// Basic root route (already existed)
app.get('/', (req, res) => {
    res.status(200).send('Backend is awake and running!');
});

// 🔥 NEW PRODUCTION HEALTH CHECK (For cron monitoring)
app.get('/health', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request().query('SELECT 1');

        res.status(200).json({
            status: "OK",
            database: "Connected",
            service: "Patient Record Backend",
            timestamp: new Date()
        });

    } catch (err) {
        console.error("Health check failed:", err);

        res.status(500).json({
            status: "ERROR",
            database: "Disconnected",
            timestamp: new Date()
        });
    }
});


// --- START THE SERVER ---
app.listen(PORT, () => {
    console.log(`Server is awake and running on port ${PORT}`);
});