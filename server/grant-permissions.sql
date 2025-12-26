-- Grant necessary permissions to fishing_user
GRANT ALL ON SCHEMA public TO fishing_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO fishing_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO fishing_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fishing_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO fishing_user;
