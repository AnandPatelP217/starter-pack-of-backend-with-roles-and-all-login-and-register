import jwt from "jsonwebtoken";

export const generatetoken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  
  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return token;
};
