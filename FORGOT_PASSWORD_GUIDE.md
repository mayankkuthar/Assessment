# Forgot Password Feature Guide

## 🔐 How It Works

The forgot password feature allows users to reset their password securely through email verification.

## 📋 User Flow

### 1. Request Password Reset
- User clicks "Forgot Password?" on the login page
- User enters their email address
- System sends a secure reset link to their email

### 2. Reset Password
- User clicks the link in their email
- User is taken to a secure password reset page
- User enters and confirms their new password
- System updates the password and redirects to login

## 🛠️ Technical Implementation

### Frontend Components
- **AuthPage.jsx**: Contains the forgot password tab and form
- **PasswordReset.jsx**: Handles the actual password reset process

### Routes
- `/reset-password`: Password reset page (accessed via email link)

### Security Features
- Email verification required
- Secure token-based reset links
- Password confirmation required
- Minimum password length validation
- Automatic redirect after successful reset

## 📧 Email Configuration

The reset emails are sent by Supabase and include:
- Secure reset link with token
- Expiration time (usually 1 hour)
- Branded email template

## 🔧 Admin Features

### View User Status
```sql
-- Check which users have requested password resets
SELECT 
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;
```

### Manual Password Reset (Admin Only)
1. Go to Supabase Dashboard → Authentication → Users
2. Find the user
3. Click "Reset Password"
4. User will receive a new reset email

## 🚨 Troubleshooting

### Common Issues

1. **Email not received**
   - Check spam folder
   - Verify email address is correct
   - Wait a few minutes for delivery

2. **Reset link expired**
   - Request a new password reset
   - Links typically expire after 1 hour

3. **Password too weak**
   - Must be at least 6 characters
   - Consider using a mix of letters, numbers, and symbols

### Error Messages

- **"Invalid or expired reset link"**: Request a new reset
- **"Passwords do not match"**: Ensure both password fields match
- **"Password must be at least 6 characters"**: Use a longer password

## 🔒 Security Notes

- Passwords are never stored in plain text
- Reset links are single-use and time-limited
- All password operations are handled by Supabase Auth
- No admin can see user passwords

## 📱 User Experience

### For Users
1. Click "Forgot Password?" on login page
2. Enter email address
3. Check email for reset link
4. Click link and enter new password
5. Sign in with new password

### For Admins
- Can help users by requesting password resets
- Can view user account status
- Cannot see or change passwords directly

## 🎯 Best Practices

1. **For Users**
   - Use a strong, unique password
   - Keep reset emails secure
   - Complete reset process quickly

2. **For Admins**
   - Guide users to use the self-service reset
   - Only use manual reset as last resort
   - Document any password-related issues

## 📞 Support

If users have trouble with password reset:
1. Check if email is correct
2. Verify email verification status
3. Request new reset if needed
4. Contact admin if issues persist 