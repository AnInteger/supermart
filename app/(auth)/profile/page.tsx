import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfileForm } from '@/components/auth/ProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      bio: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          contents: true,
          collections: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">个人中心</h1>
          <p className="text-muted-foreground">管理你的账户信息</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>更新你的个人资料</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              defaultValues={{
                name: user.name || '',
                bio: user.bio || '',
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>账户统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">{user._count.contents}</p>
                <p className="text-sm text-muted-foreground">创建的内容</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{user._count.collections}</p>
                <p className="text-sm text-muted-foreground">收藏的内容</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
