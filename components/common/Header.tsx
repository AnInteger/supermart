'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          SuperMart
        </Link>
        <nav className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          ) : session ? (
            <>
              <span className="text-sm text-muted-foreground">
                {session.user?.name || session.user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                退出
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">注册</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
