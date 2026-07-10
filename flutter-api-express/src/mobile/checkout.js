const prisma = require("../db");
const { requireAuth } = require("../auth");
const { generateSeatLabels } = require("./seatMap");

const CONVENIENCE_FEE = 1.5;
const TAX_RATE = 0.08;

function makeOrderNumber() {
    return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

module.exports = (app) => {

    // Powers the "Checkout" mobile screen. Price is always computed here from
    // the showtime's ticket_price — the client only sends which seats it wants.
    app.post("/mobile/checkout", requireAuth, async(req, res) => {
        const { showtime_id, seat_labels, payment_id, promo_code } = req.body;

        if (!showtime_id || !Array.isArray(seat_labels) || seat_labels.length === 0 || !payment_id) {
            return res.status(422).json({ message: "showtime_id, seat_labels (non-empty) and payment_id are required" });
        }

        const showtime = await prisma.showtime.findUnique({
            where: { showtime_id: Number(showtime_id) },
            include: { screen: true },
        });
        if (!showtime) return res.status(404).json({ message: "Showtime not found!" });

        const paymentMethod = await prisma.paymentMethod.findUnique({ where: { payment_id: Number(payment_id) } });
        if (!paymentMethod || paymentMethod.user_id !== req.user.sub) {
            return res.status(403).json({ message: "payment_id does not belong to this user" });
        }

        const validLabels = new Set(generateSeatLabels(showtime.screen.total_seats));
        const uniqueSeats = [...new Set(seat_labels)];
        const invalid = uniqueSeats.filter((s) => !validLabels.has(s));
        if (invalid.length > 0) {
            return res.status(422).json({ message: `Invalid seat label(s): ${invalid.join(", ")}` });
        }

        const ticketQty = uniqueSeats.length;
        const ticketPrice = Number(showtime.ticket_price);
        const subtotal = Number((ticketPrice * ticketQty).toFixed(2));
        const tax = Number((subtotal * TAX_RATE).toFixed(2));
        const total = Number((subtotal + CONVENIENCE_FEE + tax).toFixed(2));

        try {
            const booking = await prisma.$transaction(async(tx) => {
                const alreadyTaken = await tx.bookingSeat.findMany({
                    where: { showtime_id: showtime.showtime_id, seat_label: { in: uniqueSeats } },
                    select: { seat_label: true },
                });
                if (alreadyTaken.length > 0) {
                    const labels = alreadyTaken.map((s) => s.seat_label).join(", ");
                    throw Object.assign(new Error(`Seat(s) already booked: ${labels}`), { status: 409 });
                }

                const created = await tx.booking.create({
                    data: {
                        order_number: makeOrderNumber(),
                        user_id: req.user.sub,
                        showtime_id: showtime.showtime_id,
                        payment_id: paymentMethod.payment_id,
                        ticket_qty: ticketQty,
                        ticket_subtotal: subtotal,
                        convenience_fee: CONVENIENCE_FEE,
                        tax,
                        total,
                        promo_code: promo_code || null,
                        seats: {
                            create: uniqueSeats.map((seat_label) => ({
                                seat_label,
                                showtime_id: showtime.showtime_id,
                            })),
                        },
                    },
                    include: { seats: true, showtime: { include: { movie: true, screen: { include: { theater: true } } } } },
                });

                await tx.showtime.update({
                    where: { showtime_id: showtime.showtime_id },
                    data: { seats_remaining: { decrement: ticketQty } },
                });

                await tx.notification.create({
                    data: {
                        user_id: req.user.sub,
                        type: "BOOKING",
                        title: "Booking confirmed",
                        body: `${created.showtime.movie.title} · ${ticketQty} seat${ticketQty > 1 ? "s" : ""} · Order ${created.order_number}`,
                        movie_id: created.showtime.movie.movie_id,
                        booking_id: created.booking_id,
                    },
                });

                return created;
            });

            res.status(201).json(booking);
        } catch (err) {
            if (err.status === 409) return res.status(409).json({ message: err.message });
            // Unique constraint race: two checkouts hit the same seat at the same instant.
            if (err.code === "P2002") {
                return res.status(409).json({ message: "One or more selected seats were just booked. Please choose different seats." });
            }
            throw err;
        }
    });
};
