const prisma = require("../db");
const { requireAdmin } = require("../auth");

module.exports = (app) => {

    app.get("/amenities", async(req, res) => {
        const m = await prisma.amenity.findMany();
        res.json(m)
    })

    app.get("/amenities/:id", async(req, res) => {
        const m = await prisma.amenity.findUnique({
            where: { amenity_id: Number(req.params.id) }
        })
        if (!m) return res.status(404).json({ message: "Amenity not found!" })
        res.json(m)
    })

    app.post("/amenities", requireAdmin, async(req, res) => {
        const { amenity_name } = req.body;
        const m = await prisma.amenity.create({
            data: { amenity_name }
        });
        res.status(201).json(m)
    })

    app.put("/amenities/:id", requireAdmin, async(req, res) => {
        const { amenity_name } = req.body;
        const m = await prisma.amenity.update({
            where: { amenity_id: Number(req.params.id) },
            data: { amenity_name }
        })
        res.json(m)
    })

    app.delete("/amenities/:id", requireAdmin, async(req, res) => {
        try {
            await prisma.amenity.delete({
            where: { amenity_id: Number(req.params.id) }
        })
            res.json({ message: "Amenity Deleted!" })
        } catch (err) {
            if (err.code === "P2003") {
                return res.status(409).json({ message: "This amenity is still assigned to one or more theaters. Reassign them first." });
            }
            throw err;
        }
    })
}
