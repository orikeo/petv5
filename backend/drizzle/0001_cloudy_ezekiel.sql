-- ==============================
-- 1. ADD COLUMNS (nullable)
-- ==============================

ALTER TABLE "daily_check_items"
ADD COLUMN "start_date" date;

ALTER TABLE "daily_check_items"
ADD COLUMN "end_date" date;

-- ==============================
-- 2. FILL EXISTING DATA
-- ==============================

-- ставим start_date = дата создания
UPDATE "daily_check_items"
SET "start_date" = "created_at"::date
WHERE "start_date" IS NULL;

-- ==============================
-- 3. SET NOT NULL
-- ==============================

ALTER TABLE "daily_check_items"
ALTER COLUMN "start_date" SET NOT NULL;

-- ==============================
-- 4. (опционально) убрать is_active
-- ==============================

-- если уже готов отказаться от него:
ALTER TABLE "daily_check_items"
DROP COLUMN "is_active";