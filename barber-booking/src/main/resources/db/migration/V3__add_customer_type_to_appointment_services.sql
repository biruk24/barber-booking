-- Add customer type to distinguish adult and child services.
-- LEGACY preserves existing records whose customer type is unknown.

ALTER TABLE appointment_services
    ADD COLUMN customer_type VARCHAR(10) NOT NULL DEFAULT 'LEGACY'
    AFTER service_id;

-- Allow the same service to be selected for adults and children
-- within the same appointment.

ALTER TABLE appointment_services
DROP PRIMARY KEY,
ADD PRIMARY KEY (appointment_id, service_id, customer_type);
