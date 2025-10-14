-- Add unique constraint to prevent duplicate time slots
-- Only one slot per (week_start, slot_time) is allowed

-- First remove any existing duplicates
DELETE FROM time_slots 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM time_slots 
    GROUP BY week_start, slot_time
);

-- Add unique constraint
ALTER TABLE time_slots 
ADD CONSTRAINT unique_week_slot 
UNIQUE (week_start, slot_time);
