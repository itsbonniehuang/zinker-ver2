import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { fromCode, toCode, message, purpose } = req.body;
  
  try {
    const apiKey = process.env.NOTION_API_KEY;
    const chatDbId = process.env.NOTION_CHAT_DATABASE_ID;
    
    if (!apiKey || !chatDbId) {
      return res.status(400).json({ error: "系統未設定聊聊資料庫" });
    }

    if (!fromCode || !toCode || !message) {
      return res.status(400).json({ error: "資料不完整" });
    }

    if (fromCode === toCode) {
      return res.status(400).json({ error: "不能對自己發送聊聊申請" });
    }

    const properties: any = {
      "FromCode": { title: [{ text: { content: fromCode } }] },
      "ToCode": { rich_text: [{ text: { content: toCode } }] },
      "Message": { rich_text: [{ text: { content: message } }] },
      "Purpose": { select: { name: purpose || "交流" } },
      "Status": { select: { name: "pending" } },
      "CreatedAt": { date: { start: new Date().toISOString() } }
    };

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": "2022-02-22",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: chatDbId.trim() },
        properties
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save chat request");
    }

    res.status(200).json({ success: true, message: "聊聊申請已送出，請靜候管理員聯繫！" });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "發送失敗：" + error.message });
  }
}
