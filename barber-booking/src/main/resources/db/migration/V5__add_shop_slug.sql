-- Add a unique slug for public shop URLs.

ALTER TABLE barber_shops
    ADD COLUMN slug VARCHAR(180) NULL;

CREATE UNIQUE INDEX uk_barber_shops_slug
    ON barber_shops (slug);