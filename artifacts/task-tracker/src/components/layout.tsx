import { Link, useLocation } from "wouter";
import { CheckCircle2, LayoutDashboard, ListTodo } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tasks", icon: ListTodo },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-r border-border bg-card/50 backdrop-blur-sm px-4 py-6 flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-2 mb-8 text-primary">
          <CheckCircle2 className="w-6 h-6" />
          <span className="font-display font-bold text-xl tracking-tight text-foreground">Task Tracker</span>
        </div>
        
        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex-none">
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    isActive 
                      ? "bg-primary text-primary-foreground font-medium shadow-sm shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto bg-background/50">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
