export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SuperMart. 让专业从业者分享实战经验，让行业知识规模化复用
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">关于我们</a>
            <a href="#" className="hover:text-foreground">联系方式</a>
            <a href="#" className="hover:text-foreground">隐私政策</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
