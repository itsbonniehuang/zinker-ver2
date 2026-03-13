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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!apiKey || !databaseId) {
    return res.status(400).json({ 
      error: "Missing NOTION_API_KEY or NOTION_DATABASE_ID", 
      setupRequired: true 
    });
  }

  try {
    const notionResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId.trim()}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": "2022-02-22",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!notionResponse.ok) {
      const errorData = await notionResponse.json();
      throw new Error(errorData.message || `Notion API error: ${notionResponse.statusText}`);
    }

    const response: any = await notionResponse.json();

    const profiles = response.results.map((page: any) => {
      const props = page.properties;
      
      const getText = (prop: any) => {
        if (!prop) return "";
        if (prop.type === "title") return prop.title[0]?.plain_text || "";
        if (prop.type === "rich_text") return prop.rich_text[0]?.plain_text || "";
        if (prop.type === "email") return prop.email || "";
        if (prop.type === "url") return prop.url || "";
        if (prop.type === "select") return prop.select?.name || "";
        if (prop.type === "multi_select") return prop.multi_select.map((s: any) => s.name);
        return "";
      };

      const skills = getText(props.能力類別);
      const interests = getText(props.感興趣類別);

      return {
        id: page.id,
        name: getText(props.真實姓名 || props.Name || props.title),
        nickname: getText(props.暱稱),
        title: getText(props["學校/系"]),
        age: props.年齡?.number || "",
        bio: getText(props.自我介紹),
        experience: getText(props.過往經歷),
        skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
        skillsSupplement: getText(props["能力類別-補充"]),
        interests: Array.isArray(interests) ? interests : (interests ? [interests] : []),
        interestsSupplement: getText(props["感興趣類別-補充"]),
        website: getText(props.作品集連結),
        introducer: getText(props.介紹人),
        code: getText(props.專屬編碼),
        date: props.日期?.date?.start || "",
      };
    });

    res.status(200).json(profiles);
  } catch (error: any) {
    console.error("Notion API Error:", error);
    res.status(500).json({ error: `Notion 錯誤: ${error.message || "未知錯誤"}` });
  }
}
