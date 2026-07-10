const SEATS_PER_ROW = 10;

// Screens don't persist individual seats — seat labels (A1, A2, ...) are
// derived on the fly from `screen.total_seats`. Availability is determined
// by which labels are already taken for THIS showtime (tbl_booking_seats).
function generateSeatLabels(totalSeats) {
    const labels = [];
    const rows = Math.ceil(totalSeats / SEATS_PER_ROW);
    for (let r = 0; r < rows; r++) {
        const rowLetter = String.fromCharCode(65 + r);
        const seatsInRow = Math.min(SEATS_PER_ROW, totalSeats - r * SEATS_PER_ROW);
        for (let n = 1; n <= seatsInRow; n++) {
            labels.push(`${rowLetter}${n}`);
        }
    }
    return labels;
}

module.exports = { generateSeatLabels, SEATS_PER_ROW };
