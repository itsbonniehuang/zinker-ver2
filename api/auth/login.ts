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

  try {
    const { code } = req.body;
    const apiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!apiKey || !databaseId) {
      return res.status(400).json({ error: "Missing API Key or Database ID" });
    }

    if (!code) {
      return res.status(400).json({ error: "請輸入編碼" });
    }

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId.trim()}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": "2022-02-22",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "專屬編碼",
          rich_text: {
            equals: code.trim()
          }
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to query Notion");
    }

    const data: any = await response.json();
    
    if (data.results.length === 0) {
      return res.status(401).json({ error: "編碼錯誤，請重新確認。若尚未建檔請先完成建檔。" });
    }

    const page = data.results[0];
    const props = page.properties;
    
    const getText = (prop: any) => {
      if (!prop) return "";
      if (prop.type === "title") return prop.title[0]?.plain_text || "";
      if (prop.type === "rich_text") return prop.rich_text[0]?.plain_text || "";
      return "";
    };

    const profile = {
      id: page.id,
      name: getText(props.真實姓名),
      nickname: getText(props.暱稱),
      code: code.trim()
    };

    res.status(200).json({ success: true, profile });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ error: error.message });
  }
}
