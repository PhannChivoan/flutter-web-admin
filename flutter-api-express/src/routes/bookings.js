const prisma = require("../db");
const { requireAuth } = require("../auth");
const userSelect = require("../userSafeSelect");

module.exports = (app) => {

    app.get("/bookings", requireAuth, async(req, res) => {
        const m = await prisma.booking.findMany({
            include: { user: { select: userSelect }, showtime: true, payment_method: true, seats: true }
        });
        res.json(m)
    })

    app.get("/bookings/:id", requireAuth, async(req, res) => {
        const m = await prisma.booking.findUnique({
            where: { booking_id: Number(req.params.id) },
            include: { user: { select: userSelect }, showtime: true, payment_method: true, seats: true }
        })
        if (!m) return res.status(404).json({ message: "Booking not found!" })
        res.json(m)
    })

    app.post("/bookings", requireAuth, async(req, res) => {
        const { order_number, user_id, showtime_id, payment_id, ticket_qty, ticket_subtotal, convenience_fee, tax, total, promo_code, seat_labels } = req.body;
        const m = await prisma.booking.create({
            data: {
                order_number, user_id, showtime_id, payment_id,
                ticket_qty, ticket_subtotal, convenience_fee, tax, total, promo_code,
                seats: { create: seat_labels?.map(seat_label => ({ seat_label })) ?? [] }
            },
            include: { seats: true }
        });
        res.status(201).json(m)
    })

    app.put("/bookings/:id", requireAuth, async(req, res) => {
        const { promo_code } = req.body;
        const m = await prisma.booking.update({
            where: { booking_id: Number(req.params.id) },
            data: { promo_code }
        })
        res.json(m)
    })

    app.delete("/bookings/:id", requireAuth, async(req, res) => {
        await prisma.booking.delete({
            where: { booking_id: Number(req.params.id) }
        })
        res.json({ message: "Booking Deleted!" })
    })
}
