import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    originalUrl: { type: String, required: true, index: true },
    shortId: { type: String, required: true, unique: true },
    clicks: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    ipAddress: { type: String },
    // Links are deleted automatically 14 days after creation.
    createdAt: { type: Date, default: Date.now, expires: "14d" },
  },
  { timestamps: true },
);

export default mongoose.model("Url", urlSchema);
