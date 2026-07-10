-- CreateEnum
CREATE TYPE "MovieStatus" AS ENUM ('NOW_SHOWING', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "ScreenFormat" AS ENUM ('STANDARD', 'IMAX', 'IMAX_LASER', 'DOLBY_CINEMA');

-- CreateEnum
CREATE TYPE "ShowtimeStatus" AS ENUM ('AVAILABLE', 'FILLING_FAST', 'SOLD_OUT');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CREDIT_CARD', 'DIGITAL_WALLET');

-- CreateEnum
CREATE TYPE "SearchType" AS ENUM ('RECENT_SEARCH', 'TRENDING', 'GENRE_FILTER');

-- CreateTable
CREATE TABLE "tbl_movies" (
    "movie_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content_rating" TEXT,
    "duration_min" INTEGER,
    "star_rating" DECIMAL(3,1),
    "status" "MovieStatus" NOT NULL DEFAULT 'NOW_SHOWING',
    "release_date" DATE,
    "synopsis" TEXT,
    "genre_id" INTEGER,

    CONSTRAINT "tbl_movies_pkey" PRIMARY KEY ("movie_id")
);

-- CreateTable
CREATE TABLE "tbl_genres" (
    "genre_id" SERIAL NOT NULL,
    "genre_name" TEXT NOT NULL,

    CONSTRAINT "tbl_genres_pkey" PRIMARY KEY ("genre_id")
);

-- CreateTable
CREATE TABLE "tbl_cast" (
    "cast_id" SERIAL NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "character_name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "tbl_cast_pkey" PRIMARY KEY ("cast_id")
);

-- CreateTable
CREATE TABLE "tbl_theaters" (
    "theater_id" SERIAL NOT NULL,
    "theater_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "distance_miles" DECIMAL(5,2),
    "star_rating" DECIMAL(3,1),
    "amenity_id" INTEGER,

    CONSTRAINT "tbl_theaters_pkey" PRIMARY KEY ("theater_id")
);

-- CreateTable
CREATE TABLE "tbl_amenities" (
    "amenity_id" SERIAL NOT NULL,
    "amenity_name" TEXT NOT NULL,

    CONSTRAINT "tbl_amenities_pkey" PRIMARY KEY ("amenity_id")
);

-- CreateTable
CREATE TABLE "tbl_screens" (
    "screen_id" SERIAL NOT NULL,
    "theater_id" INTEGER NOT NULL,
    "screen_name" TEXT NOT NULL,
    "format_type" "ScreenFormat" NOT NULL DEFAULT 'STANDARD',
    "total_seats" INTEGER NOT NULL,

    CONSTRAINT "tbl_screens_pkey" PRIMARY KEY ("screen_id")
);

-- CreateTable
CREATE TABLE "tbl_showtimes" (
    "showtime_id" SERIAL NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "screen_id" INTEGER NOT NULL,
    "show_date" DATE NOT NULL,
    "show_time" TIME NOT NULL,
    "availability" "ShowtimeStatus" NOT NULL DEFAULT 'AVAILABLE',
    "seats_remaining" INTEGER NOT NULL,

    CONSTRAINT "tbl_showtimes_pkey" PRIMARY KEY ("showtime_id")
);

-- CreateTable
CREATE TABLE "tbl_loyalty_tiers" (
    "tier_id" SERIAL NOT NULL,
    "tier_name" TEXT NOT NULL,
    "min_points" INTEGER NOT NULL,
    "next_tier_id" INTEGER,

    CONSTRAINT "tbl_loyalty_tiers_pkey" PRIMARY KEY ("tier_id")
);

-- CreateTable
CREATE TABLE "tbl_users" (
    "user_id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "loyalty_tier_id" INTEGER NOT NULL,
    "loyalty_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "tbl_payment_methods" (
    "payment_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "card_last4" CHAR(4),
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tbl_payment_methods_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "tbl_bookings" (
    "booking_id" SERIAL NOT NULL,
    "order_number" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "showtime_id" INTEGER NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "ticket_qty" INTEGER NOT NULL,
    "ticket_subtotal" DECIMAL(10,2) NOT NULL,
    "convenience_fee" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "promo_code" TEXT,
    "booked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "tbl_booking_seats" (
    "seat_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "seat_label" TEXT NOT NULL,

    CONSTRAINT "tbl_booking_seats_pkey" PRIMARY KEY ("seat_id")
);

-- CreateTable
CREATE TABLE "tbl_watchlist" (
    "user_id" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_watchlist_pkey" PRIMARY KEY ("user_id","movie_id")
);

-- CreateTable
CREATE TABLE "tbl_search_history" (
    "search_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "search_type" "SearchType" NOT NULL,
    "entry" TEXT NOT NULL,
    "category" TEXT,
    "searched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_search_history_pkey" PRIMARY KEY ("search_id")
);

-- CreateTable
CREATE TABLE "tbl_app_screens" (
    "screen_id" SERIAL NOT NULL,
    "screen_name" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "nav_tab" TEXT,
    "auth_required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tbl_app_screens_pkey" PRIMARY KEY ("screen_id")
);

-- CreateTable
CREATE TABLE "tbl_settings" (
    "setting_id" SERIAL NOT NULL,
    "section" TEXT NOT NULL,
    "setting_name" TEXT NOT NULL,
    "default_value" TEXT,

    CONSTRAINT "tbl_settings_pkey" PRIMARY KEY ("setting_id")
);

-- CreateTable
CREATE TABLE "tbl_user_settings" (
    "user_id" INTEGER NOT NULL,
    "setting_id" INTEGER NOT NULL,
    "current_value" TEXT,

    CONSTRAINT "tbl_user_settings_pkey" PRIMARY KEY ("user_id","setting_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_genres_genre_name_key" ON "tbl_genres"("genre_name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_amenities_amenity_name_key" ON "tbl_amenities"("amenity_name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_users_email_key" ON "tbl_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_bookings_order_number_key" ON "tbl_bookings"("order_number");

-- AddForeignKey
ALTER TABLE "tbl_movies" ADD CONSTRAINT "tbl_movies_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "tbl_genres"("genre_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_cast" ADD CONSTRAINT "tbl_cast_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "tbl_movies"("movie_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_theaters" ADD CONSTRAINT "tbl_theaters_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "tbl_amenities"("amenity_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_screens" ADD CONSTRAINT "tbl_screens_theater_id_fkey" FOREIGN KEY ("theater_id") REFERENCES "tbl_theaters"("theater_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_showtimes" ADD CONSTRAINT "tbl_showtimes_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "tbl_movies"("movie_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_showtimes" ADD CONSTRAINT "tbl_showtimes_screen_id_fkey" FOREIGN KEY ("screen_id") REFERENCES "tbl_screens"("screen_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_loyalty_tiers" ADD CONSTRAINT "tbl_loyalty_tiers_next_tier_id_fkey" FOREIGN KEY ("next_tier_id") REFERENCES "tbl_loyalty_tiers"("tier_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_users" ADD CONSTRAINT "tbl_users_loyalty_tier_id_fkey" FOREIGN KEY ("loyalty_tier_id") REFERENCES "tbl_loyalty_tiers"("tier_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_payment_methods" ADD CONSTRAINT "tbl_payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_bookings" ADD CONSTRAINT "tbl_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_bookings" ADD CONSTRAINT "tbl_bookings_showtime_id_fkey" FOREIGN KEY ("showtime_id") REFERENCES "tbl_showtimes"("showtime_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_bookings" ADD CONSTRAINT "tbl_bookings_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "tbl_payment_methods"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_booking_seats" ADD CONSTRAINT "tbl_booking_seats_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "tbl_bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_watchlist" ADD CONSTRAINT "tbl_watchlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_watchlist" ADD CONSTRAINT "tbl_watchlist_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "tbl_movies"("movie_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_search_history" ADD CONSTRAINT "tbl_search_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_user_settings" ADD CONSTRAINT "tbl_user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_user_settings" ADD CONSTRAINT "tbl_user_settings_setting_id_fkey" FOREIGN KEY ("setting_id") REFERENCES "tbl_settings"("setting_id") ON DELETE RESTRICT ON UPDATE CASCADE;
