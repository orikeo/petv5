-- 1. убираем старые ограничения / индексы (если нужно)
DROP INDEX IF EXISTS "fuel_logs_car_odometer_idx";

-- 2. делаем odometer nullable
ALTER TABLE "fuel_logs"
ALTER COLUMN "odometer" DROP NOT NULL;

-- 3. price_per_liter делаем NOT NULL
ALTER TABLE "fuel_logs"
ALTER COLUMN "price_per_liter" SET NOT NULL;

-- 4. total_price делаем NOT NULL
ALTER TABLE "fuel_logs"
ALTER COLUMN "total_price" SET NOT NULL;

-- 5. full_tank по умолчанию false
ALTER TABLE "fuel_logs"
ALTER COLUMN "full_tank" SET DEFAULT false;

-- 6. добавляем новую колонку (nullable!)
ALTER TABLE "fuel_logs"
ADD COLUMN "fuel_date" date;

-- 7. заполняем старые данные
UPDATE "fuel_logs"
SET "fuel_date" = "created_at"::date;

-- 8. теперь делаем NOT NULL
ALTER TABLE "fuel_logs"
ALTER COLUMN "fuel_date" SET NOT NULL;

-- 9. создаём индексы
CREATE INDEX "fuel_logs_car_date_idx"
ON "fuel_logs" ("car_id", "fuel_date");

CREATE INDEX "fuel_logs_car_odometer_idx"
ON "fuel_logs" ("car_id", "odometer");