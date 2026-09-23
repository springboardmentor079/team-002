const mongoose = require("mongoose");

const delaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Activity / Phase Name is required"],
    },
    due: {
      type: String,
      default: "TBD",
    },
    delay: {
      type: String,
      required: [true, "Delay impact & reason is required"],
    },
    status: {
      type: String,
      default: "Delayed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Delay", delaySchema);
