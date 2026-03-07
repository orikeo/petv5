CREATE TABLE "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"odometer" integer NOT NULL,
	"liters" numeric(10, 2) NOT NULL,
	"price_per_liter" numeric(10, 2),
	"total_price" numeric(10, 2),
	"full_tank" boolean DEFAULT true NOT NULL,
	"station" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repairs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"repair_type_id" uuid NOT NULL,
	"odometer" integer,
	"price" numeric(10, 2) NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repairs" ADD CONSTRAINT "repairs_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repairs" ADD CONSTRAINT "repairs_repair_type_id_repair_types_id_fk" FOREIGN KEY ("repair_type_id") REFERENCES "public"."repair_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fuel_logs_car_idx" ON "fuel_logs" USING btree ("car_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fuel_logs_car_odometer_idx" ON "fuel_logs" USING btree ("car_id","odometer");--> statement-breakpoint
CREATE INDEX "repairs_car_idx" ON "repairs" USING btree ("car_id");--> statement-breakpoint
CREATE INDEX "repairs_type_idx" ON "repairs" USING btree ("repair_type_id");