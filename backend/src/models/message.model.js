import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    attachment: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Method to update the status of a message
messageSchema.methods.updateStatus = async function (status) {
  if (!["sent", "delivered", "read"].includes(status)) {
    throw new Error("Invalid status");
  }
  this.status = status;
  return this.save();
};

// Method to format the message object for JSON response
messageSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Add compound index for better query performance
messageSchema.index({ sender: 1, receiver: 1, timestamp: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
