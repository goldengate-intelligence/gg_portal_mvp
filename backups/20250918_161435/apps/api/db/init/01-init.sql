-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create additional databases if they don't exist
SELECT 'CREATE DATABASE goldengate_test' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'goldengate_test')\gexec

-- Set timezone
SET timezone = 'UTC';

-- Create a readonly user for analytics/reporting
CREATE ROLE goldengate_readonly;
GRANT CONNECT ON DATABASE goldengate TO goldengate_readonly;
GRANT USAGE ON SCHEMA public TO goldengate_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO goldengate_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO goldengate_readonly;

-- Create application user with limited privileges
CREATE USER goldengate_app WITH PASSWORD 'goldengate_app_password';
GRANT CONNECT ON DATABASE goldengate TO goldengate_app;
GRANT USAGE, CREATE ON SCHEMA public TO goldengate_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO goldengate_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO goldengate_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO goldengate_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO goldengate_app;