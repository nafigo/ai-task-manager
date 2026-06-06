// src/app/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../services/supabase';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Yapay Zeka Görev Yöneticisi</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">Devam etmek için giriş yapın veya kayıt olun</p>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-posta Adresi',
                password_label: 'Şifre',
                button_label: 'Giriş Yap',
                loading_button_label: 'Giriş Yapılıyor...',
                email_input_placeholder: 'E-posta adresiniz',
                password_input_placeholder: 'Şifreniz',
                link_text: 'Zaten hesabınız var mı? Giriş yapın'
              },
              sign_up: {
                email_label: 'E-posta Adresi',
                password_label: 'Şifre',
                button_label: 'Kayıt Ol',
                loading_button_label: 'Kayıt Olunuyor...',
                email_input_placeholder: 'E-posta adresiniz',
                password_input_placeholder: 'Şifreniz',
                link_text: 'Hesabınız yok mu? Kayıt olun'
              }
            }
          }}
        />
      </div>
    </div>
  );
}