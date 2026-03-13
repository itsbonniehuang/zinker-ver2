import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.query;
  const { password, status } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "zinkeradmin2026";

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "密碼錯誤" });
  }

  try {
    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) throw new Error("Missing NOTION_API_KEY");

    const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": "2022-02-22",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          "Status": { select: { name: status } }
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Notion update failed");
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
