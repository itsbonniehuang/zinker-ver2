import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log("REQ", req.method, req.url);
  console.log("ENV CHECK", {
    hasNotionKey: !!process.env.NOTION_API_KEY,
    hasDb: !!process.env.NOTION_DATABASE_ID
  });

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.query;
  const { password, updates } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "zinkeradmin2026";

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "密碼錯誤" });
  }

  try {
    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) throw new Error("Missing NOTION_API_KEY");
    
    // Fetch the current page to determine property types
    const getPageResponse = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": "2022-02-22",
      },
    });
    
    if (!getPageResponse.ok) {
      throw new Error("Failed to fetch page metadata");
    }
    
    const pageData: any = await getPageResponse.json();
    const currentProps = pageData.properties;
    
    const properties: any = {};
    
    const setProp = (name: string, value: any) => {
      const prop = currentProps[name];
      if (!prop) return;

      if (prop.type === "title") {
        properties[name] = { title: [{ text: { content: String(value) } }] };
      } else if (prop.type === "rich_text") {
        properties[name] = { rich_text: [{ text: { content: String(value) } }] };
      } else if (prop.type === "number") {
        if (value === "" || value === null || value === undefined) {
          properties[name] = { number: null };
        } else {
          const num = Number(value);
          properties[name] = { number: isNaN(num) ? null : num };
        }
      } else if (prop.type === "url") {
        const url = String(value).trim();
        properties[name] = { url: url || null };
      } else if (prop.type === "email") {
        const email = String(value).trim();
        properties[name] = { email: email || null };
      }
    };

    if (updates.realName !== undefined) {
      const titlePropName = Object.keys(currentProps).find(k => currentProps[k].type === "title") || "真實姓名";
      setProp(titlePropName, updates.realName);
    }
    
    if (updates.nickname !== undefined) setProp("暱稱", updates.nickname);
    if (updates.title !== undefined) setProp("學校/系", updates.title);
    if (updates.age !== undefined) setProp("年齡", updates.age);
    if (updates.bio !== undefined) setProp("自我介紹", updates.bio);
    if (updates.experience !== undefined) setProp("過往經歷", updates.experience);
    if (updates.skillsSupplement !== undefined) setProp("能力類別-補充", updates.skillsSupplement);
    if (updates.interestsSupplement !== undefined) setProp("感興趣類別-補充", updates.interestsSupplement);
    if (updates.website !== undefined) setProp("作品集連結", updates.website);
    
    if (updates.contact !== undefined) {
      if (currentProps["聯絡方式1"]) setProp("聯絡方式1", updates.contact);
      else if (currentProps["Email"]) setProp("Email", updates.contact);
    }
    
    if (updates.introducer !== undefined) setProp("介紹人", updates.introducer);

    const notionResponse = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": "2022-02-22",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties }),
    });

    if (!notionResponse.ok) {
      const errorData = await notionResponse.json();
      throw new Error(errorData.message || "Notion update failed");
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Admin Update Error:", error);
    res.status(500).json({ error: error.message });
  }
}
