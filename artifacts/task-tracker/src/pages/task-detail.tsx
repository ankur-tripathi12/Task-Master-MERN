import { useRoute } from "wouter";
import { useGetTask, useToggleTask, useDeleteTask, getGetTaskQueryKey, getGetTasksQueryKey, getGetTaskStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Calendar, CheckCircle2, Circle, Clock, Flame, Loader2, Tag, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskForm } from "@/components/task-form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function TaskDetail() {
  const [, params] = useRoute("/tasks/:id");
  const id = params?.id;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: task, isLoading, error } = useGetTask(id!, {
    query: {
      enabled: !!id,
      queryKey: getGetTaskQueryKey(id!),
    }
  });

  const toggleTask = useToggleTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(id!) });
        queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
      }
    }
  });

  const deleteTask = useDeleteTask({
    mutation: {
      onSuccess: () => {
        toast({ title: "Task deleted" });
        queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
        setLocation("/tasks");
      }
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Task not found</h2>
        <p className="text-muted-foreground mb-6">The task you're looking for doesn't exist or has been deleted.</p>
        <Link href="/tasks">
          <Button variant="outline">Back to Tasks</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this task. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteTask.mutate({ id: task.id })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border bg-muted/20">
          <div className="flex items-start gap-4 mb-4">
            <button 
              onClick={() => toggleTask.mutate({ id: task.id })}
              className="shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none mt-1"
              disabled={toggleTask.isPending}
            >
              {toggleTask.isPending ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : task.status === "completed" ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <Circle className="w-8 h-8" />
              )}
            </button>
            <h1 className={`text-3xl md:text-4xl font-display font-bold leading-tight ${task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              {task.title}
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground ml-12">
            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${task.priority === 'high' ? 'text-destructive' : task.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'}`} />
              <span className="capitalize">{task.priority} Priority</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Due {format(new Date(task.dueDate), "MMMM d, yyyy")}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Created {format(new Date(task.createdAt), "MMM d")}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-display font-semibold mb-4 text-foreground">Edit Task</h3>
              <TaskForm task={task} />
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Tags</h4>
              {task.tags && task.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {task.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1.5 font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      <Tag className="w-3 h-3" /> {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No tags added</p>
              )}
            </div>

            <div className="pt-6 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Status</h4>
              <Badge variant="outline" className={`text-sm px-3 py-1 font-medium ${
                task.status === 'completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
                task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 
                'bg-muted text-muted-foreground'
              }`}>
                {task.status.replace("-", " ")}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
