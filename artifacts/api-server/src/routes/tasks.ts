import { Router } from "express";
import { Task } from "../models/Task";
import {
  GetTasksQueryParams,
  CreateTaskBody,
  UpdateTaskBody,
  GetTaskParams,
  UpdateTaskParams,
  DeleteTaskParams,
  ToggleTaskParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/tasks", async (req, res) => {
  const query = GetTasksQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const filter: Record<string, string> = {};
  if (query.data.status) filter["status"] = query.data.status;
  if (query.data.priority) filter["priority"] = query.data.priority;

  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.json(tasks.map((t) => t.toJSON()));
});

router.post("/tasks", async (req, res) => {
  const body = CreateTaskBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const task = new Task({
    title: body.data.title,
    description: body.data.description ?? null,
    status: body.data.status ?? "pending",
    priority: body.data.priority,
    dueDate: body.data.dueDate ?? null,
    tags: body.data.tags ?? [],
  });

  await task.save();
  res.status(201).json(task.toJSON());
});

router.get("/tasks/stats", async (_req, res) => {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0]!;
  const todayStr = now.toISOString().split("T")[0]!;

  const [total, pending, inProgress, completed, highPriority, dueSoon] =
    await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: "pending" }),
      Task.countDocuments({ status: "in-progress" }),
      Task.countDocuments({ status: "completed" }),
      Task.countDocuments({ priority: "high", status: { $ne: "completed" } }),
      Task.countDocuments({
        dueDate: { $gte: todayStr, $lte: sevenDaysStr },
        status: { $ne: "completed" },
      }),
    ]);

  res.json({ total, pending, inProgress, completed, highPriority, dueSoon });
});

router.get("/tasks/:id", async (req, res) => {
  const params = GetTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid task ID" });
    return;
  }

  const task = await Task.findById(params.data.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(task.toJSON());
});

router.patch("/tasks/:id", async (req, res) => {
  const params = UpdateTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid task ID" });
    return;
  }

  const body = UpdateTaskBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const task = await Task.findByIdAndUpdate(
    params.data.id,
    { $set: body.data },
    { new: true, runValidators: true },
  );

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(task.toJSON());
});

router.delete("/tasks/:id", async (req, res) => {
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid task ID" });
    return;
  }

  const task = await Task.findByIdAndDelete(params.data.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.status(204).send();
});

router.patch("/tasks/:id/toggle", async (req, res) => {
  const params = ToggleTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid task ID" });
    return;
  }

  const task = await Task.findById(params.data.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  task.status = task.status === "completed" ? "pending" : "completed";
  await task.save();

  res.json(task.toJSON());
});

export default router;
