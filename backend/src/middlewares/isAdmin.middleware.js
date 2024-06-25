// middleware/isAdmin.js
import { User } from "../models/user.model";

function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No user logged in" });
  }

  if (req.user.role === "admin") {
    next(); // User has admin role, proceed to the next middleware/route handler
  } else {
    res
      .status(403)
      .json({ message: "Forbidden: You do not have admin privileges" });
  }
}

export default { isAdmin };
