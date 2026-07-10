-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CUSTOMER');

-- AlterTable
ALTER TABLE "tbl_users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE "tbl_refresh_tokens" (
    "token_id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_refresh_tokens_pkey" PRIMARY KEY ("token_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_refresh_tokens_token_key" ON "tbl_refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "tbl_refresh_tokens" ADD CONSTRAINT "tbl_refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
