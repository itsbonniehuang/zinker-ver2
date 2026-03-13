import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "zinkeradmin2026";

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "密碼錯誤" });
  }

  try {
    const apiKey = process.env.NOTION_API_KEY;
    const chatDbId = process.env.NOTION_CHAT_DATABASE_ID;

    if (!apiKey || !chatDbId) {
      return res.status(400).json({ error: "Missing NOTION_API_KEY or NOTION_CHAT_DATABASE_ID" });
    }

    const response = await fetch(`https://api.notion.com/v1/databases/${chatDbId.trim()}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": "2022-02-22",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sorts: [
          {
            property: "CreatedAt",
            direction: "descending"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Notion API error");
    }

    const data: any = await response.json();
    
    const chats = data.results.map((page: any) => {
      const props = page.properties;
      const getText = (prop: any) => {
        if (!prop) return "";
        if (prop.type === "title") return prop.title[0]?.plain_text || "";
        if (prop.type === "rich_text") return prop.rich_text[0]?.plain_text || "";
        if (prop.type === "select") return prop.select?.name || "";
        if (prop.type === "date") return prop.date?.start || "";
        return "";
      };

      return {
        id: page.id,
        fromCode: getText(props.FromCode),
        toCode: getText(props.ToCode),
        message: getText(props.Message),
        purpose: getText(props.Purpose),
        status: getText(props.Status),
        createdAt: getText(props.CreatedAt)
      };
    });

    res.status(200).json(chats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
