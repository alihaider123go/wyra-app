"use client";

import { createAdminClient, createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const VerifyEmail = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const adminSupabase = await createAdminClient();
      const supabase = await createClient();
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        return;
      }

      // 1. Get token record
      const { data: record, error } = await supabase
        .from('email_verifications')
        .select('user_id, expires_at')
        .eq('token', token)
        .single();


      if (error || !record || new Date(record.expires_at) < new Date()) {
        setStatus('error');
        return;
      }

      // 2. Mark user as verified
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ is_email_verified: true })
        .eq('id', record.user_id) // <-- use correct column

      if (profileError) {
        setStatus('error');
        return;
      }

      // 3. Delete the token
      await adminSupabase.from('email_verifications').delete().eq('token', token);

      setStatus('success');

      // 4. Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    };

    verify();
  }, [router]);

  return (
    <div>
      {status === 'loading' && <p>Verifying email...</p>}
      {status === 'success' && <p>Email verified successfully! Redirecting to home...</p>}
      {status === 'error' && <p>Verification failed. The link may be invalid or expired.</p>}
    </div>
  );
}

export default VerifyEmail;
