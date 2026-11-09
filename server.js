
require("dotenv").config({
    path: require("path").join(__dirname, ".env")
});

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const path = require("path");

// Bihar Tourism website files serve karega
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.use(cors());
app.use(express.json());

// ================= SUPABASE DATABASE =================

const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

// ================= ADMIN LOGIN =================

app.post("/api/admin/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password required"
            });
        }

        if (username !== process.env.ADMIN_USERNAME) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            process.env.ADMIN_PASSWORD_HASH
        );

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        const token = jwt.sign(
            { username },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            success: true,
            message: "Admin login successful",
            token
        });

    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// ================= ADMIN AUTHENTICATION =================

function verifyAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    try {
        const token = authHeader.split(" ")[1];
        req.admin = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired login"
        });
    }
}

// ========== GET CONTACT MESSAGES ==========

app.get("/api/admin/messages", verifyAdmin, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM contacts ORDER BY id DESC"
        );

        res.json({
            success: true,
            messages: result.rows
        });

    } catch (error) {
        console.error("Load Messages Error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load messages"
        });
    }
});

// ========== DELETE CONTACT MESSAGE ==========

app.delete("/api/admin/messages/:id", verifyAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID"
            });
        }

        const result = await db.query(
            "DELETE FROM contacts WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        res.json({
            success: true,
            message: "Message deleted successfully!"
        });

    } catch (error) {
        console.error("Delete Message Error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to delete message"
        });
    }
});

// ================= BACKEND TEST =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("Bihar Tourism Server is running on port:", PORT);
});

// ================= CONTACT FORM =================

app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields."
            });
        }

        const result = await db.query(
            `INSERT INTO contacts (name, email, subject, message)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [
                name.trim(),
                email.trim(),
                subject.trim(),
                message.trim()
            ]
        );

        console.log("Contact saved. Insert ID:", result.rows[0].id);

        res.status(201).json({
            success: true,
            message: "Your message has been saved successfully!"
        });

    } catch (error) {
        console.error("Contact Save Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error. Please try again."
        });
    }
});

// ================= START SERVER =================

async function startServer() {
    try {
        await db.query("SELECT 1");

        console.log("Supabase PostgreSQL Connected Successfully!");

        app.listen(process.env.PORT || 3000, () => {
            console.log("Bihar Tourism Server is running");
        });

    } catch (error) {
        console.error("Database Connection Failed:", error.message);
        process.exit(1);
    }
}

startServer();
