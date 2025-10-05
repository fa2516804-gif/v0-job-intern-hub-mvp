-- Script to promote a user to admin role
-- Replace 'admin@example.com' with the actual email of the user you want to make admin

-- First, find the user by email and update their role to admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@example.com';

-- If you want to create a completely new admin user, you'll need to:
-- 1. Sign up through the app first with the email you want
-- 2. Then run this script with that email to promote them to admin

-- To verify the admin was created:
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE role = 'admin';
