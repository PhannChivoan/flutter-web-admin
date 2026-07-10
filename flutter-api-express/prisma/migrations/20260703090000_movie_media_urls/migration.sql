-- Movie cover image + trailer video (either uploaded to /uploads or an external URL)

ALTER TABLE "tbl_movies" ADD COLUMN "poster_url" TEXT;
ALTER TABLE "tbl_movies" ADD COLUMN "trailer_url" TEXT;
