-- AlterTable
ALTER TABLE "tbl_theaters" ADD COLUMN     "description" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "latitude" DECIMAL(9,6),
ADD COLUMN     "longitude" DECIMAL(9,6),
ADD COLUMN     "phone" TEXT;
