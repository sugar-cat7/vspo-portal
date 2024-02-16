import { NextApiRequest, NextApiResponse } from "next";

export const validateGetRequest = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: Function, // eslint-disable-line @typescript-eslint/ban-types
) => {
  const referer = req.headers.referer;
  const host = req.headers.host;

  // Ensure both referer and host exist, and that the referer includes the host
  if (!referer || !host || !referer.includes(host)) {
    // If the referer does not include the host, return a 403 Forbidden status
    res.status(403).json({ message: "Access Denied" });
    return;
  }
  // Validate HTTP method
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Validate API key
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.API_SECRET) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};
