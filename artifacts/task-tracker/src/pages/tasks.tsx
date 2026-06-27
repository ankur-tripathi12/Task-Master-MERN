import { useState } from "react";
import { useGetTasks, useDeleteTask, useToggleTask, getGetTasksQueryKey, getGetTaskStatsQueryKey } from "@workspace/api-client-react";
import type { Task, GetTasksStatus, GetTasksPriority } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { CheckCircle2, Circle, Loader2, Plus, SearchX, Trash2, Calendar, Tag, MoreVertical, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { TaskForm } from "@/components/task-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState<GetTasksStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<GetTasksPriority | "all">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const queryParams = {
    ...(statusFilter !== "all" && { status: statusFilter as GetTasksStatus }),
    ...(priorityFilter !== "all" && { priority: priorityFilter as GetTasksPriority }),
  };

  const { data: tasks, isLoading } = useGetTasks(queryParams);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage and track your to-dos.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-task">
              <Plus className="w-4 h-4" /> New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <TaskForm onSuccess={() => setIsCreateOpen(false)} onCancel={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-2 rounded-xl border border-border">
        <div className="w-full sm:w-[200px]">
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
            <SelectTrigger className="border-transparent bg-transparent hover:bg-muted/50 focus:ring-0">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={priorityFilter} onValueChange={(val: any) => setPriorityFilter(val)}>
            <SelectTrigger className="border-transparent bg-transparent hover:bg-muted/50 focus:ring-0">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : tasks && tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border flex flex-col items-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display font-medium text-foreground mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {statusFilter !== "all" || priorityFilter !== "all" 
              ? "We couldn't find any tasks matching your current filters."
              : "You have a clean slate. Time to add something to do."}
          </p>
          {(statusFilter !== "all" || priorityFilter !== "all") && (
            <Button variant="outline" onClick={() => { setStatusFilter("all"); setPriorityFilter("all"); }}>
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function TaskItem({ task }: { task: Task }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const toggleTask = useToggleTask({
    mutation: {
      onSuccess: () => {
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
      }
    }
  });

  return (
    <div className={`group flex items-start gap-4 p-4 md:p-5 bg-card rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all ${task.status === 'completed' ? 'bg-card/50 opacity-75' : ''}`}>
      <button 
        onClick={() => toggleTask.mutate({ id: task.id })}
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none mt-0.5"
        disabled={toggleTask.isPending}
        data-testid={`toggle-task-${task.id}`}
      >
        {toggleTask.isPending ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : task.status === "completed" ? (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        ) : (
          <Circle className="w-6 h-6" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
          <Link href={`/tasks/${task.id}`}>
            <h3 className={`font-medium text-base truncate cursor-pointer hover:text-primary transition-colors ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            {task.priority === "high" && <Badge variant="destructive" className="h-5 text-[10px] px-1.5 py-0 uppercase tracking-wider font-bold">High</Badge>}
            {task.priority === "medium" && <Badge variant="secondary" className="h-5 text-[10px] px-1.5 py-0 uppercase tracking-wider font-bold">Medium</Badge>}
            {task.priority === "low" && <Badge variant="outline" className="h-5 text-[10px] px-1.5 py-0 uppercase tracking-wider font-bold text-muted-foreground border-border">Low</Badge>}
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
            {task.description}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
          {task.dueDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
            </div>
          )}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <div className="flex items-center gap-1">
                {task.tags.map((tag, i) => (
                  <span key={i} className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2">
                  <Edit2 className="w-4 h-4" /> Edit task
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <TaskForm task={task} onSuccess={() => setIsEditOpen(false)} onCancel={() => setIsEditOpen(false)} />
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 className="w-4 h-4" /> Delete task
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{task.title}". This action cannot be undone.
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
