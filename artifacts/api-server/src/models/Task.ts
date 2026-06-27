import mongoose, { type Document, Schema } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string | null;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    dueDate: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret["id"] = String(ret["_id"]);
        const { _id: _omitId, __v: _omitV, ...rest } = ret;
        return { ...rest, id: ret["id"] };
      },
    },
  },
);

export const Task = mongoose.model<ITask>("Task", TaskSchema);
