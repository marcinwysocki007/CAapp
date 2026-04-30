/*
  # Create function to retrieve SMTP config from vault

  1. New Functions
    - `get_smtp_config()` - Returns SMTP configuration from vault secrets
      - Returns: JSON object with host, port, user, pass, from, fromName, siteUrl
      - Security: SECURITY DEFINER to access vault with elevated privileges
      - Only accessible by service_role

  2. Security
    - Function runs as definer (postgres) to access vault schema
    - Restricted to service_role via GRANT
*/

CREATE OR REPLACE FUNCTION get_smtp_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'host', COALESCE((SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'smtp_host' LIMIT 1), 'smtp.ionos.de'),
    'port', COALESCE((SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'smtp_port' LIMIT 1), '587'),
    'user', COALESCE((SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'smtp_user' LIMIT 1), ''),
    'pass', COALESCE((SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'smtp_pass' LIMIT 1), ''),
    'from', COALESCE((SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'smtp_from' LIMIT 1), ''),
    'fromName', COALESCE((SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'smtp_from_name' LIMIT 1), 'Primundus 24h-Pflege'),
    'siteUrl', COALESCE((SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'site_url' LIMIT 1), 'https://kostenrechner.primundus.de')
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION get_smtp_config() FROM PUBLIC;
REVOKE ALL ON FUNCTION get_smtp_config() FROM anon;
REVOKE ALL ON FUNCTION get_smtp_config() FROM authenticated;
GRANT EXECUTE ON FUNCTION get_smtp_config() TO service_role;
