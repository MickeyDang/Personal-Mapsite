import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ token: process.env.MAPBOX_ACCESS_TOKEN });
}
