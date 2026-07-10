// Auto refresh
// npm install -g nodemon

// Install prisma
// npm install prisma @prisma/client
// npx prisma init
// npm install @prisma/config

const express = require("express");
const db = require("./db");
const app = express()


app.use(express.json());

app.get("/",(req, res)=>{
    res.send("Hello World");
});

app.get("/users",async(req, res)=>{
    const result = await db.query("SELECT * FROM tbl_users");
    res.json(result.rows);
});

app.get("/users/:id",async(req,res)=>{
    const result = await db.query("SELECT * FROM tbl_users where id  = $1",[req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message : "User not found"});
    res.json(result.rows[0]);
})

app.post("/users",async (req,res)=>{
    const {name, email, password} = req.body;
    const result = await db.query(
        "INSERT INTO tbl_users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
        [name, email, password]
    );
    res.status(201).json(result.rows[0])
})

app.put("/users/:id",async (req,res)=>{
    const {name, password} = req.body;
    await db.query("UPDATE tbl_users SET name = $1, password = $2 WHERE id = $3 RETURNING *",[name, password, req.params.id]);
    res.json(result.rows[0]);
})

app.delete("/users/:id",async (req,res)=>{
    await db.query("DELETE FROM tbl_users where id = $1",[req.params.id]);
    res.json({ message : "User deleted"});
})


app.listen(8000,()=>{
    console.log("Server is running on http://localhost:8000 or http://127.0.0.1:8000/")
})  