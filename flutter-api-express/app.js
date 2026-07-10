// Auto refresh
// npm install -g nodemon

// Install prisma
// npm install prisma @prisma/client
// npx prisma init
// npm install @prisma/config

require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



require("./src/index")(app);

// Turns uncaught Prisma/route errors into clean JSON instead of Express's
// default HTML+stack-trace page (which the admin UI can't parse).
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err instanceof multer.MulterError) {
        return res.status(422).json({ message: err.message });
    }
    if (/must be an (image|video) file/.test(err.message || "")) {
        return res.status(422).json({ message: err.message });
    }
    if (err.code === "P2025") {
        return res.status(404).json({ message: "Record not found" });
    }
    if (err.code === "P2003") {
        return res.status(409).json({ message: "This action is blocked by related records. Remove them first." });
    }
    if (err.code === "P2002") {
        return res.status(409).json({ message: "A record with that value already exists." });
    }

    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
});

app.listen(8000,()=>{
    console.log("Server is running on http://localhost:8000 or http://127.0.0.1:8000/")
})  
module.exports = app