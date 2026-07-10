const prisma = require("../db");
const { requireAdmin } = require("../auth");

// Accepts either a bare "YYYY-MM-DD" or a full ISO datetime and always
// returns a full ISO datetime string, since @db.Date/@db.Time columns still
// require a complete DateTime value from the Prisma client.
function toIsoDate(value) {
    if (!value) return value;
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : value;
}

module.exports = (app) => {

    app.get("/showtimes", async(req, res) => {
        const { theater_id, movie_id, date } = req.query;
        const where = {
            ...(movie_id ? { movie_id: Number(movie_id) } : {}),
            ...(theater_id ? { screen: { theater_id: Number(theater_id) } } : {}),
            ...(date ? { show_date: new Date(toIsoDate(date)) } : {}),
        };

        const m = await prisma.showtime.findMany({
            where,
            include: { movie: true, screen: true }
        });
        res.json(m)
    })

    app.get("/showtimes/:id", async(req, res) => {
        const m = await prisma.showtime.findUnique({
            where: { showtime_id: Number(req.params.id) },
            include: { movie: true, screen: true }
        })
        if (!m) return res.status(404).json({ message: "Showtime not found!" })
        res.json(m)
    })

    app.post("/showtimes", requireAdmin, async(req, res) => {
        const { movie_id, screen_id, show_date, show_time, availability, seats_remaining, ticket_price } = req.body;

        let remaining = seats_remaining;
        if (remaining === undefined || remaining === null) {
            const screen = await prisma.screen.findUnique({ where: { screen_id: Number(screen_id) } });
            if (!screen) return res.status(404).json({ message: "Screen not found!" });
            remaining = screen.total_seats;
        }

        const m = await prisma.showtime.create({
            data: {
                movie_id: Number(movie_id),
                screen_id: Number(screen_id),
                show_date: toIsoDate(show_date),
                show_time: toIsoDate(show_time),
                availability: availability || "AVAILABLE",
                seats_remaining: remaining,
                ...(ticket_price !== undefined ? { ticket_price } : {}),
            },
            include: { movie: true, screen: true },
        });
        res.status(201).json(m)
    })

    app.put("/showtimes/:id", requireAdmin, async(req, res) => {
        const { show_date, show_time, availability, seats_remaining, ticket_price } = req.body;
        const m = await prisma.showtime.update({
            where: { showtime_id: Number(req.params.id) },
            data: {
                show_date: toIsoDate(show_date),
                show_time: toIsoDate(show_time),
                availability,
                seats_remaining,
                ticket_price,
            }
        })
        res.json(m)
    })

    app.delete("/showtimes/:id", requireAdmin, async(req, res) => {
        try {
            await prisma.showtime.delete({
                where: { showtime_id: Number(req.params.id) }
            })
            res.json({ message: "Showtime Deleted!" })
        } catch (err) {
            if (err.code === "P2003") {
                return res.status(409).json({
                    message: "This screening already has bookings and can't be deleted.",
                });
            }
            throw err;
        }
    })
}
