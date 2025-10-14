-- Add slot_time column to reservations table
ALTER TABLE reservations
ADD COLUMN slot_time text;

-- Update existing reservations with the corresponding time slot
UPDATE reservations r
SET slot_time = ts.slot_time
FROM time_slots ts
WHERE r.time_slot_id = ts.id;

-- Make the column required after update
ALTER TABLE reservations
ALTER COLUMN slot_time SET NOT NULL; 