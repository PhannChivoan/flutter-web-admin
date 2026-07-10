const prisma = require("../db");
const { requireAdmin } = require("../auth");
const { uploadPoster, uploadTrailer, publicUrl } = require("../upload");

// HTML date inputs send "YYYY-MM-DD" (or "") which Prisma's ISO-8601 parser
// rejects for @db.Date columns unless converted to a Date/null first.
function parseDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

module.exports = (app) => {

    app.get("/movies", async(req, res) => {
        const m = await prisma.movie.findMany({
            include: { genre: true }
        });
        res.json(m)
    })

    app.get("/movies/:id", async(req, res) => {
        const m = await prisma.movie.findUnique({
            where: { movie_id: Number(req.params.id) },
            include: { genre: true, cast: { include: { actor: true }, orderBy: { position: "asc" } } }
        })
        if (!m) return res.status(404).json({ message: "Movie not found!" })
        res.json(m)
    })

    app.post("/movies", requireAdmin, async(req, res) => {
        const { title, content_rating, duration_min, star_rating, status, release_date, synopsis, genre_id, poster_url, trailer_url } = req.body;
        const m = await prisma.movie.create({
            data: { title, content_rating, duration_min, star_rating, status, release_date: parseDate(release_date), synopsis, genre_id, poster_url, trailer_url }
        });

        // Fan out a "coming soon" notification to every user so it shows up
        // in their inbox with a red-dot badge on the mobile app.
        if (m.status === "COMING_SOON") {
            const users = await prisma.user.findMany({ select: { user_id: true } });
            if (users.length > 0) {
                await prisma.notification.createMany({
                    data: users.map((u) => ({
                        user_id: u.user_id,
                        type: "MOVIE",
                        title: "Coming soon",
                        body: `${m.title} is coming soon — check it out.`,
                        movie_id: m.movie_id,
                    })),
                });
            }
        }

        res.status(201).json(m)
    })

    app.put("/movies/:id", requireAdmin, async(req, res) => {
        const { title, content_rating, duration_min, star_rating, status, release_date, synopsis, genre_id, poster_url, trailer_url } = req.body;
        const m = await prisma.movie.update({
            where: { movie_id: Number(req.params.id) },
            data: { title, content_rating, duration_min, star_rating, status, release_date: parseDate(release_date), synopsis, genre_id, poster_url, trailer_url }
        })
        res.json(m)
    })

    app.delete("/movies/:id", requireAdmin, async(req, res) => {
        try {
            await prisma.movie.delete({
                where: { movie_id: Number(req.params.id) }
            })
            res.json({ message: "Movie Deleted!" })
        } catch (err) {
            if (err.code === "P2003") {
                return res.status(409).json({
                    message: "This movie has scheduled showtimes, cast, or watchlist entries and can't be deleted. Remove its showtimes first.",
                });
            }
            throw err;
        }
    })

    // Cover image upload (multipart/form-data, field name "file"). Alternative
    // to setting poster_url directly via PUT /movies/:id for admins who'd
    // rather paste an already-hosted image URL.
    app.post("/movies/:id/poster", requireAdmin, uploadPoster.single("file"), async(req, res) => {
        if (!req.file) return res.status(422).json({ message: "file is required" });
        const poster_url = publicUrl("posters", req.file.filename);
        const m = await prisma.movie.update({
            where: { movie_id: Number(req.params.id) },
            data: { poster_url }
        });
        res.json(m)
    })

    // Trailer video upload (multipart/form-data, field name "file").
    app.post("/movies/:id/trailer", requireAdmin, uploadTrailer.single("file"), async(req, res) => {
        if (!req.file) return res.status(422).json({ message: "file is required" });
        const trailer_url = publicUrl("trailers", req.file.filename);
        const m = await prisma.movie.update({
            where: { movie_id: Number(req.params.id) },
            data: { trailer_url }
        });
        res.json(m)
    })
}
