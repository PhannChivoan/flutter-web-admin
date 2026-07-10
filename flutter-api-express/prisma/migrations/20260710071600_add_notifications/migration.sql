-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING', 'MOVIE');

-- CreateTable
CREATE TABLE "tbl_notifications" (
    "notification_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "movie_id" INTEGER,
    "booking_id" INTEGER,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_notifications_pkey" PRIMARY KEY ("notification_id")
);

-- AddForeignKey
ALTER TABLE "tbl_notifications" ADD CONSTRAINT "tbl_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_notifications" ADD CONSTRAINT "tbl_notifications_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "tbl_movies"("movie_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_notifications" ADD CONSTRAINT "tbl_notifications_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "tbl_bookings"("booking_id") ON DELETE SET NULL ON UPDATE CASCADE;
