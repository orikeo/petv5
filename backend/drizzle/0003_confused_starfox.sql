ALTER TABLE "repairs" ADD COLUMN "repair_date" date NOT NULL;--> statement-breakpoint
CREATE INDEX "repairs_car_repair_date_idx" ON "repairs" USING btree ("car_id","repair_date");