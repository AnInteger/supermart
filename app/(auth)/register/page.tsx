import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <RegisterForm />

      <div className="text-center text-sm">
        <span className="text-muted-foreground">已有账号？</span>
        <Link href="/login" className="text-primary hover:underline ml-1">
          立即登录
        </Link>
      </div>
    </div>
  );
}
