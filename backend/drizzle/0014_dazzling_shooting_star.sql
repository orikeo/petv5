CREATE TYPE "public"."daily_check_applies_mode" AS ENUM('every_day', 'selected_days');--> statement-breakpoint
CREATE TYPE "public"."daily_check_status" AS ENUM('yes', 'no', 'skipped');--> statement-breakpoint
CREATE TABLE "daily_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"mood_score" integer,
	"mood_comment" text,
	"summary" text,
	"note" text,
	"music_of_day" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_check_entries" ADD COLUMN "status" "daily_check_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_check_entries" ADD COLUMN "skip_reason" text;--> statement-breakpoint
ALTER TABLE "daily_check_items" ADD COLUMN "emoji" text;--> statement-breakpoint
ALTER TABLE "daily_check_items" ADD COLUMN "applies_mode" "daily_check_applies_mode" DEFAULT 'every_day' NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_check_items" ADD COLUMN "week_days_csv" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_reports_user_date_idx" ON "daily_reports" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "daily_check_items_user_sort_idx" ON "daily_check_items" USING btree ("user_id","sort_order");--> statement-breakpoint
ALTER TABLE "daily_check_entries" DROP COLUMN "value";