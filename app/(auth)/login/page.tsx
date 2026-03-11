import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <LoginForm />

      <div className="text-center text-sm">
        <span className="text-muted-foreground">还没有账号？</span>
        <Link href="/register" className="text-primary hover:underline ml-1">
          立即注册
        </Link>
      </div>
    </div>
  );
}
