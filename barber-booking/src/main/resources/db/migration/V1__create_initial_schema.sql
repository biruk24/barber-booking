-- ============================================ -- BARBER BOOKING DATABASE - INITIAL SCHEMA -- Flyway Migration V1 -- ============================================
-- ============================================ -- 1. USERS -- ============================================
CREATE TABLE users ( id BIGINT AUTO_INCREMENT PRIMARY KEY,
                     name VARCHAR(100) NOT NULL,

                     email VARCHAR(150) NOT NULL UNIQUE,

                     password VARCHAR(255) NOT NULL,

                     phone VARCHAR(20) NOT NULL UNIQUE,

                     role VARCHAR(30) NOT NULL DEFAULT 'BARBER',

                     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- ============================================ -- 2. BARBER SHOPS -- ============================================
CREATE TABLE barber_shops ( id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            user_id BIGINT NOT NULL UNIQUE,

                            name VARCHAR(150) NOT NULL,

                            description TEXT,

                            phone VARCHAR(20),

                            address VARCHAR(255),

                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                            CONSTRAINT fk_barber_shop_user
                                FOREIGN KEY (user_id)
                                    REFERENCES users(id)
);
-- ============================================ -- 3. SERVICES -- ============================================
CREATE TABLE services ( id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        barber_shop_id BIGINT NOT NULL,

                        name VARCHAR(100) NOT NULL,

                        description TEXT,

                        duration_minutes INT NOT NULL,

                        adult_price DECIMAL(10, 2) NOT NULL,

                        child_price DECIMAL(10, 2),

                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                        CONSTRAINT fk_service_barber_shop
                            FOREIGN KEY (barber_shop_id)
                                REFERENCES barber_shops(id),

                        CONSTRAINT chk_service_duration
                            CHECK (duration_minutes > 0),

                        CONSTRAINT chk_service_adult_price
                            CHECK (adult_price >= 0),

                        CONSTRAINT chk_service_child_price
                            CHECK (
                                child_price IS NULL
                                    OR child_price >= 0
                                )
);
-- ============================================ -- 4. WORKING HOURS -- ============================================
CREATE TABLE working_hours ( id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             barber_shop_id BIGINT NOT NULL,

                             day_of_week VARCHAR(15) NOT NULL,

                             opening_time TIME,

                             closing_time TIME,

                             is_closed BOOLEAN NOT NULL DEFAULT FALSE,

                             CONSTRAINT fk_working_hours_barber_shop
                                 FOREIGN KEY (barber_shop_id)
                                     REFERENCES barber_shops(id),

                             CONSTRAINT uq_working_hours_day
                                 UNIQUE (barber_shop_id, day_of_week)
);
-- ============================================ -- 5. APPOINTMENTS -- ============================================
CREATE TABLE appointments ( id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            barber_shop_id BIGINT NOT NULL,

                            customer_name VARCHAR(100) NOT NULL,

                            customer_phone VARCHAR(20) NOT NULL,

                            appointment_date DATE NOT NULL,

                            start_time TIME NOT NULL,

                            end_time TIME NOT NULL,

                            adult_count INT NOT NULL DEFAULT 0,

                            child_count INT NOT NULL DEFAULT 0,

                            status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                            CONSTRAINT fk_appointment_barber_shop
                                FOREIGN KEY (barber_shop_id)
                                    REFERENCES barber_shops(id),

                            CONSTRAINT chk_adult_count
                                CHECK (adult_count >= 0),

                            CONSTRAINT chk_child_count
                                CHECK (child_count >= 0),

                            CONSTRAINT chk_total_people
                                CHECK (
                                    adult_count + child_count > 0
                                    ),

                            CONSTRAINT chk_appointment_time
                                CHECK (
                                    end_time > start_time
                                    )
);
-- ============================================ -- 6. APPOINTMENT SERVICES -- ============================================
CREATE TABLE appointment_services ( appointment_id BIGINT NOT NULL,
                                    service_id BIGINT NOT NULL,

                                    PRIMARY KEY (appointment_id, service_id),

                                    CONSTRAINT fk_appointment_services_appointment
                                        FOREIGN KEY (appointment_id)
                                            REFERENCES appointments(id)
                                            ON DELETE CASCADE,

                                    CONSTRAINT fk_appointment_services_service
                                        FOREIGN KEY (service_id)
                                            REFERENCES services(id)
);