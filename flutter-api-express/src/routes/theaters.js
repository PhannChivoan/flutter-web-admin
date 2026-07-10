const prisma = require("../db");
const { requireAdmin } = require("../auth");
const { uploadTheaterImage, publicUrl } = require("../upload");

module.exports = (app) => {

    app.get("/theaters", async(req, res) => {
        const m = await prisma.theater.findMany({
            include: { amenity: true, screens: true }
        });
        res.json(m)
    })

    app.get("/theaters/:id", async(req, res) => {
        const m = await prisma.theater.findUnique({
            where: { theater_id: Number(req.params.id) },
            include: { amenity: true, screens: true }
        })
        if (!m) return res.status(404).json({ message: "Theater not found!" })
        res.json(m)
    })

    app.post("/theaters", requireAdmin, async(req, res) => {
        const { theater_name, address, city, state, zip, distance_miles, star_rating, amenity_id, latitude, longitude, image_url, phone, description } = req.body;
        const m = await prisma.theater.create({
            data: { theater_name, address, city, state, zip, distance_miles, star_rating, amenity_id, latitude, longitude, image_url, phone, description }
        });
        res.status(201).json(m)
    })

    app.put("/theaters/:id", requireAdmin, async(req, res) => {
        const { theater_name, address, city, state, zip, distance_miles, star_rating, amenity_id, latitude, longitude, image_url, phone, description } = req.body;
        const m = await prisma.theater.update({
            where: { theater_id: Number(req.params.id) },
            data: { theater_name, address, city, state, zip, distance_miles, star_rating, amenity_id, latitude, longitude, image_url, phone, description }
        })
        res.json(m)
    })

    app.delete("/theaters/:id", requireAdmin, async(req, res) => {
        try {
            await prisma.theater.delete({
            where: { theater_id: Number(req.params.id) }
        })
            res.json({ message: "Theater Deleted!" })
        } catch (err) {
            if (err.code === "P2003") {
                return res.status(409).json({ message: "This branch still has screens (and possibly showtimes) attached. Remove them first." });
            }
            throw err;
        }
    })

    // Branch image upload (multipart/form-data, field name "file").
    app.post("/theaters/:id/image", requireAdmin, uploadTheaterImage.single("file"), async(req, res) => {
        if (!req.file) return res.status(422).json({ message: "file is required" });
        const image_url = publicUrl("theaters", req.file.filename);
        const m = await prisma.theater.update({
            where: { theater_id: Number(req.params.id) },
            data: { image_url }
        });
        res.json(m)
    })
}
