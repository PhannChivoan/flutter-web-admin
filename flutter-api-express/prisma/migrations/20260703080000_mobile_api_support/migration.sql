-- Mobile API support: ticket pricing, QR tickets, seat-collision prevention, profile fields

ALTER TABLE "tbl_showtimes" ADD COLUMN "ticket_price" DECIMAL(6,2) NOT NULL DEFAULT 12.50;

ALTER TABLE "tbl_bookings" ADD COLUMN "qr_code" TEXT;
UPDATE "tbl_bookings" SET "qr_code" = 'legacy_' || "booking_id"::text WHERE "qr_code" IS NULL;
ALTER TABLE "tbl_bookings" ALTER COLUMN "qr_code" SET NOT NULL;
CREATE UNIQUE INDEX "tbl_bookings_qr_code_key" ON "tbl_bookings"("qr_code");

ALTER TABLE "tbl_booking_seats" ADD COLUMN "showtime_id" INTEGER;
UPDATE "tbl_booking_seats" bs
  SET "showtime_id" = b."showtime_id"
  FROM "tbl_bookings" b
  WHERE b."booking_id" = bs."booking_id" AND bs."showtime_id" IS NULL;
ALTER TABLE "tbl_booking_seats" ALTER COLUMN "showtime_id" SET NOT NULL;
CREATE UNIQUE INDEX "tbl_booking_seats_showtime_id_seat_label_key" ON "tbl_booking_seats"("showtime_id", "seat_label");
ALTER TABLE "tbl_booking_seats" ADD CONSTRAINT "tbl_booking_seats_showtime_id_fkey"
  FOREIGN KEY ("showtime_id") REFERENCES "tbl_showtimes"("showtime_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tbl_users" ADD COLUMN "phone" TEXT;
ALTER TABLE "tbl_users" ADD COLUMN "avatar_url" TEXT;
