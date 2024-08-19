import { NextApiRequest, NextApiResponse } from "next";
import Airtable from "airtable";

const ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "Moments";
const VIEW_NAME = "Main";
const COLUMNS = [
  "File",
];

const base = new Airtable({ apiKey: ACCESS_TOKEN }).base(
  BASE_ID,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { key } = req.query;
  
  try {
    const records = await base(TABLE_NAME)
      .select({
        view: VIEW_NAME,
        fields: COLUMNS,
        filterByFormula: `{Title} = "${key}"`,
      })
      .all();

    const imageUrls = [];
    
    for (const record of records) {
      if (record.fields["File"]) {
        // Check if it's an array before iterating
        if (Array.isArray(record.fields["File"])) {
          for (const file of record.fields["File"]) {
            imageUrls.push(file.url);
          }
        } else {
          // If it's a single object, just push its url
          imageUrls.push(record.fields["File"][0].url);
        }
      }
    }

    res.status(200).json({ imageUrls });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
}
