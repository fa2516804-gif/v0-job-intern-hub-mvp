/*
  # Create Admin User

  1. Changes
    - Creates a default admin user in auth.users table
    - Creates corresponding profile with admin role
    - Email: admin@jobportal.com
    - Password: Admin@123456
  
  2. Security
    - Admin user will have full access to all features
    - Password should be changed after first login
*/

-- Insert admin user into auth.users table
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@jobportal.com';
  
  IF admin_user_id IS NULL THEN
    -- Generate a new UUID for admin user
    admin_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      recovery_token
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@jobportal.com',
      crypt('Admin@123456', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin User"}',
      false,
      'authenticated',
      'authenticated',
      '',
      ''
    );
    
    -- Insert into profiles table
    INSERT INTO profiles (
      id,
      email,
      full_name,
      role,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'admin@jobportal.com',
      'Admin User',
      'admin',
      now(),
      now()
    );
    
    RAISE NOTICE 'Admin user created successfully with email: admin@jobportal.com';
  ELSE
    RAISE NOTICE 'Admin user already exists';
  END IF;
END $$;