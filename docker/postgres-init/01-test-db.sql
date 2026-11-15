-- Separate database for the API's end-to-end tests, so tests never touch dev data.
CREATE DATABASE tactyqal_dev OWNER tactyqal;
CREATE DATABASE tactyqal_test OWNER tactyqal;
