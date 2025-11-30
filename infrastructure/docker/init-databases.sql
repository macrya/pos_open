-- Initialize databases for each microservice
CREATE DATABASE pos_auth;
CREATE DATABASE pos_inventory;
CREATE DATABASE pos_sales;
CREATE DATABASE pos_payments;
CREATE DATABASE pos_customers;
CREATE DATABASE pos_reporting;
CREATE DATABASE pos_notifications;
CREATE DATABASE pos_users;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE pos_auth TO postgres;
GRANT ALL PRIVILEGES ON DATABASE pos_inventory TO postgres;
GRANT ALL PRIVILEGES ON DATABASE pos_sales TO postgres;
GRANT ALL PRIVILEGES ON DATABASE pos_payments TO postgres;
GRANT ALL PRIVILEGES ON DATABASE pos_customers TO postgres;
GRANT ALL PRIVILEGES ON DATABASE pos_reporting TO postgres;
GRANT ALL PRIVILEGES ON DATABASE pos_notifications TO postgres;
GRANT ALL PRIVILEGES ON DATABASE pos_users TO postgres;
