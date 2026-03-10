import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
            SuperMart
          </Link>
          <p className="text-muted-foreground mt-2">
            国内垂类AI工具平台
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
