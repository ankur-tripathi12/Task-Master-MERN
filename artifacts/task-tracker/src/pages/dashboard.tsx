import { useGetTaskStats, useGetTasks, useToggleTask, getGetTasksQueryKey, getGetTaskStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { CheckCircle2, Circle, Clock, Flame, LayoutList, Loader2, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useGetTaskStats();
  const { data: tasks, isLoading: tasksLoading } = useGetTasks();

  const toggleTask = useToggleTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
      }
    }
  });

  const recentTasks = tasks?.slice(0, 5) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Good Morning</h1>
          <p className="text-muted-foreground mt-1">Here is what is happening with your tasks today.</p>
        </div>
        <Link href="/tasks">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors" data-testid="link-all-tasks">
            View all tasks <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total" value={stats?.total} icon={LayoutList} loading={statsLoading} />
        <StatCard title="Completed" value={stats?.completed} icon={CheckCircle2} loading={statsLoading} className="text-green-600 dark:text-green-400" />
        <StatCard title="High Priority" value={stats?.highPriority} icon={Flame} loading={statsLoading} className="text-primary" />
        <StatCard title="Due Soon" value={stats?.dueSoon} icon={Clock} loading={statsLoading} className="text-amber-500" />
      </div>

      <div>
        <h2 className="text-xl font-display font-semibold mb-4 text-foreground">Recent Tasks</h2>
        {tasksLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : recentTasks.length > 0 ? (
          <div className="space-y-3">
            {recentTasks.map(task => (
              <div key={task.id} className="group flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4 overflow-hidden">
                  <button 
                    onClick={() => toggleTask.mutate({ id: task.id })}
                    className="shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                    disabled={toggleTask.isPending}
                    data-testid={`toggle-task-${task.id}`}
                  >
                    {toggleTask.isPending && toggleTask.variables?.id === task.id ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : task.status === "completed" ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <Link href={`/tasks/${task.id}`}>
                      <h3 className={`font-medium truncate cursor-pointer hover:text-primary transition-colors ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {task.dueDate && <span>Due {format(new Date(task.dueDate), "MMM d")}</span>}
                      {task.priority === "high" && <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] px-1.5 py-0 h-4">High</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <LayoutList className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No tasks yet</h3>
            <p className="text-muted-foreground">Get started by creating your first task.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, loading, className = "" }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`w-4 h-4 ${className}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold font-display">{value || 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
