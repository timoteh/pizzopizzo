-- Add week_start column to reservations table
ALTER TABLE reservations
ADD COLUMN week_start date;

-- Update existing reservations with the corresponding week date
UPDATE reservations r
SET week_start = ts.week_start
FROM time_slots ts
WHERE r.time_slot_id = ts.id;

-- Make the column required after update
ALTER TABLE reservations
ALTER COLUMN week_start SET NOT NULL; 