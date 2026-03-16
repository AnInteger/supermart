import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <RegisterForm />

      <div className="text-center text-sm pt-4 border-t border-slate-100">
        <span className="text-slate-500">已有账号？</span>
        <Link
          href="/login"
          className="text-purple-600 hover:text-purple-700 font-medium ml-1"
        >
          立即登录
        </Link>
      </div>
    </div>
  );
}
