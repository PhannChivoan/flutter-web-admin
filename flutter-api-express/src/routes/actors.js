const prisma = require("../db");
const { requireAdmin } = require("../auth");
const { uploadActorPhoto, publicUrl } = require("../upload");

module.exports = (app) => {

    app.get("/actors", async(req, res) => {
        const m = await prisma.actor.findMany({ orderBy: { name: "asc" } });
        res.json(m)
    })

    app.get("/actors/:id", async(req, res) => {
        const m = await prisma.actor.findUnique({
            where: { actor_id: Number(req.params.id) },
            include: { cast: { include: { movie: true } } }
        })
        if (!m) return res.status(404).json({ message: "Actor not found!" })
        res.json(m)
    })

    app.post("/actors", requireAdmin, async(req, res) => {
        const { name, photo_url, bio } = req.body;
        const m = await prisma.actor.create({ data: { name, photo_url, bio } });
        res.status(201).json(m)
    })

    app.put("/actors/:id", requireAdmin, async(req, res) => {
        const { name, photo_url, bio } = req.body;
        const m = await prisma.actor.update({
            where: { actor_id: Number(req.params.id) },
            data: { name, photo_url, bio }
        })
        res.json(m)
    })

    app.delete("/actors/:id", requireAdmin, async(req, res) => {
        try {
            await prisma.actor.delete({ where: { actor_id: Number(req.params.id) } })
            res.json({ message: "Actor Deleted!" })
        } catch (err) {
            if (err.code === "P2003") {
                return res.status(409).json({ message: "This actor is still cast in movies. Remove those cast entries first." });
            }
            throw err;
        }
    })

    // Actor photo upload (multipart/form-data, field name "file").
    app.post("/actors/:id/photo", requireAdmin, uploadActorPhoto.single("file"), async(req, res) => {
        if (!req.file) return res.status(422).json({ message: "file is required" });
        const photo_url = publicUrl("actors", req.file.filename);
        const m = await prisma.actor.update({
            where: { actor_id: Number(req.params.id) },
            data: { photo_url }
        });
        res.json(m)
    })
}
