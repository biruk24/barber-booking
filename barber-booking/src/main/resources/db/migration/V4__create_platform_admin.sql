INSERT INTO users (
    name,
    email,
    password,
    phone,
    role,
    created_at,
    updated_at
)
SELECT
    'Platform Owner',
    'biruklemma24@gmail.com',
    '$2a$10$CmY5fZa5OC5hR5YAcl.XX.JGMn2XZsgD1yDDJn2wV5m81A49TUHa2',
    '0979052446',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
    WHERE NOT EXISTS (
    SELECT 1
    FROM users
    WHERE email = 'biruklemma24@gmail.com'
);