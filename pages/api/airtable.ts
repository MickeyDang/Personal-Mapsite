import { NextApiRequest, NextApiResponse } from "next";
import Airtable from "airtable";

const ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "Moments";
const VIEW_NAME = "Main";
const COLUMNS = [
  "Title",
  "Description",
  "Date",
  "Longitude",
  "Latitude",
  "Link",
  "Tags",
  "LinkTitle",
];

const base = new Airtable({ apiKey: ACCESS_TOKEN }).base(
  BASE_ID,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const records = await base(TABLE_NAME)
      .select({
        view: VIEW_NAME,
        fields: COLUMNS,
      })
      .all();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
}
