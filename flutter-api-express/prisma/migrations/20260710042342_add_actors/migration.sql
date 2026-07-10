/*
  Warnings:

  - Added the required column `actor_id` to the `tbl_cast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbl_cast" ADD COLUMN     "actor_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "tbl_actors" (
    "actor_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "photo_url" TEXT,
    "bio" TEXT,

    CONSTRAINT "tbl_actors_pkey" PRIMARY KEY ("actor_id")
);

-- AddForeignKey
ALTER TABLE "tbl_cast" ADD CONSTRAINT "tbl_cast_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "tbl_actors"("actor_id") ON DELETE RESTRICT ON UPDATE CASCADE;
