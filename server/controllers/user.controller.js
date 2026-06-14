import User from "../models/User.js";

export const getAgents = async (_req, res) => {
  try {
    const agents = await User.find({ role: "agent" }).select("name email _id");
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
