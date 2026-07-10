-- Remove duplicate cast rows for the same (movie_id, actor_id) pair, keeping the earliest entry
DELETE FROM "tbl_cast" a
USING "tbl_cast" b
WHERE a.cast_id > b.cast_id
  AND a.movie_id = b.movie_id
  AND a.actor_id = b.actor_id;

-- AlterTable
ALTER TABLE "tbl_cast" ADD CONSTRAINT "tbl_cast_movie_id_actor_id_key" UNIQUE ("movie_id", "actor_id");
