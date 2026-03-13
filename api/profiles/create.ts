import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateUserCode } from '../_utils/code';

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

  try {
    const { profile } = req.body;
    const apiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!apiKey || !databaseId) {
      return res.status(400).json({ error: "Missing API Key or Database ID" });
    }

    // Generate a unique code
    let userCode = generateUserCode(8);
    
    // Check if code exists (simple check)
    const checkResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId.trim()}/query`, {
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
            equals: userCode
          }
        }
      }),
    });

    if (checkResponse.ok) {
      const checkData: any = await checkResponse.json();
      if (checkData.results.length > 0) {
        // If exists, try one more time (statistically unlikely to collide twice)
        userCode = generateUserCode(8);
      }
    }

    const properties: any = {
      "真實姓名": { title: [{ text: { content: profile.name } }] },
      "暱稱": { rich_text: [{ text: { content: profile.nickname || "" } }] },
      "學校/系": { rich_text: [{ text: { content: profile.title || "" } }] },
      "自我介紹": { rich_text: [{ text: { content: profile.bio || "" } }] },
      "過往經歷": { rich_text: [{ text: { content: profile.experience || "" } }] },
      "能力類別-補充": { rich_text: [{ text: { content: profile.skillsSupplement || "" } }] },
      "感興趣類別-補充": { rich_text: [{ text: { content: profile.interestsSupplement || "" } }] },
      "作品集連結": { url: profile.website || null },
      "介紹人": { rich_text: [{ text: { content: profile.introducer || "" } }] },
      "專屬編碼": { rich_text: [{ text: { content: userCode } }] },
      "備註": { rich_text: [{ text: { content: profile.note || "" } }] },
      "日期": { date: { start: new Date().toISOString().split('T')[0] } }
    };

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": "2022-02-22",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: databaseId.trim() },
        properties
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create Notion page");
    }

    res.status(200).json({ success: true, code: userCode });
  } catch (error: any) {
    console.error("Create Profile Error:", error);
    res.status(500).json({ error: error.message });
  }
}
