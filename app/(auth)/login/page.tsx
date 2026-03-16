import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <LoginForm />

      <div className="text-center text-sm pt-4 border-t border-slate-100">
        <span className="text-slate-500">还没有账号？</span>
        <Link
          href="/register"
          className="text-purple-600 hover:text-purple-700 font-medium ml-1"
        >
          立即注册
        </Link>
      </div>
    </div>
  );
}
