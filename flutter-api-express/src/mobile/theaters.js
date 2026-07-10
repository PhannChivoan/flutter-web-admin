const prisma = require("../db");

module.exports = (app) => {

    // Powers the "Theater Locations" mobile screen.
    app.get("/mobile/theaters", async(req, res) => {
        const theaters = await prisma.theater.findMany({
            include: { amenity: true },
            orderBy: { distance_miles: "asc" },
        });
        res.json(theaters);
    });

    app.get("/mobile/theaters/:id", async(req, res) => {
        const theater = await prisma.theater.findUnique({
            where: { theater_id: Number(req.params.id) },
            include: { amenity: true, screens: true },
        });
        if (!theater) return res.status(404).json({ message: "Theater not found!" });
        res.json(theater);
    });

    // Powers the "Branch Showtimes" mobile screen: showtimes at one theater,
    // optionally filtered to a single day (?date=YYYY-MM-DD) and/or movie.
    app.get("/mobile/theaters/:id/showtimes", async(req, res) => {
        const theaterId = Number(req.params.id);
        const { date, movie_id } = req.query;

        const where = {
            screen: { theater_id: theaterId },
            ...(movie_id ? { movie_id: Number(movie_id) } : {}),
            ...(date ? { show_date: new Date(date) } : {}),
        };

        const showtimes = await prisma.showtime.findMany({
            where,
            include: { movie: true, screen: true },
            orderBy: [{ show_date: "asc" }, { show_time: "asc" }],
        });

        res.json(showtimes);
    });
};
