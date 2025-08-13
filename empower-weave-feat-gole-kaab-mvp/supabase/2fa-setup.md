# Gole Kaab - Supabase 2FA Setup

This document outlines the steps required to enable Two-Factor Authentication (2FA) for the Gole Kaab application using Supabase.

## 1. Enable 2FA in Your Supabase Project

You need to enable 2FA for your project in the Supabase dashboard.

1.  Go to your Supabase project dashboard.
2.  Navigate to **Authentication** -> **Providers**.
3.  Enable the **Email** provider if it's not already enabled.
4.  Navigate to **Authentication** -> **Settings**.
5.  Scroll down to the **MFA** section.
6.  Enable **Allow enrolling new MFA factors**.
7.  (Optional) You can also choose to **Require MFA for all new users**.

## 2. (For existing users) Enroll a user for 2FA

To enroll an existing user for 2FA, you need to call the `auth.mfa.enroll` function. This is typically done from a user's profile settings page.

Example (to be implemented in a "Profile Settings" page):

```javascript
import { supabase } from '@/integrations/supabase/client';

async function enroll2FA() {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp', // or 'sms'
  });

  if (error) {
    console.error('Error enrolling in 2FA:', error);
    return;
  }

  // Show the QR code to the user to scan with their authenticator app
  // data.totp.qr_code is a SVG string
  const qrCodeSvg = data.totp.qr_code;

  // You would then need to verify the OTP to complete the enrollment
}
```

## 3. How the Current Implementation Works

The current implementation in `AuthContext.tsx` and `Auth.tsx` handles the sign-in flow for users who have 2FA enabled.

- When a user with 2FA enabled signs in, Supabase returns an error indicating that a second factor is required.
- The `signIn` function in `AuthContext.tsx` catches this error and sets the `requires2FA` state to `true`.
- The `Auth.tsx` page then displays a form for the user to enter their One-Time Password (OTP).
- The `signInWithOtp` function is called to verify the OTP and complete the sign-in process.

By following these steps, you can enable and use 2FA in your Gole Kaab application.
