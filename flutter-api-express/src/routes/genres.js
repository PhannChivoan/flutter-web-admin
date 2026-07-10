const prisma = require("../db");
const { requireAdmin } = require("../auth");

module.exports = (app) => {

    app.get("/genres", async(req, res) => {
        const m = await prisma.genre.findMany();
        res.json(m)
    })

    app.get("/genres/:id", async(req, res) => {
        const m = await prisma.genre.findUnique({
            where: { genre_id: Number(req.params.id) }
        })
        if (!m) return res.status(404).json({ message: "Genre not found!" })
        res.json(m)
    })

    app.post("/genres", requireAdmin, async(req, res) => {
        const { genre_name } = req.body;
        const m = await prisma.genre.create({
            data: { genre_name }
        });
        res.status(201).json(m)
    })

    app.put("/genres/:id", requireAdmin, async(req, res) => {
        const { genre_name } = req.body;
        const m = await prisma.genre.update({
            where: { genre_id: Number(req.params.id) },
            data: { genre_name }
        })
        res.json(m)
    })

    app.delete("/genres/:id", requireAdmin, async(req, res) => {
        try {
            await prisma.genre.delete({
            where: { genre_id: Number(req.params.id) }
        })
            res.json({ message: "Genre Deleted!" })
        } catch (err) {
            if (err.code === "P2003") {
                return res.status(409).json({ message: "This genre is still assigned to one or more movies. Reassign them first." });
            }
            throw err;
        }
    })
}
