import type { VercelRequest, VercelResponse } from '@vercel/node';

// Fallback events if NOTION_EVENTS_DATABASE_ID is not provided
const fallbackEvents = [
  {
    id: '1',
    title: '2026 全國青年創業競賽',
    type: '比賽',
    date: '2026-05-20',
    description: '展現你的創意與商業頭腦，爭取百萬創業獎金與導師輔導機會。',
    link: '#',
    highlight: '爭取百萬創業獎金與導師輔導機會',
    schedule: '2026-05-20 至 2026-08-20',
    teamSize: '2-5 人',
    deadline: '2026-04-30',
    fee: '免費',
    prize: '新台幣 100 萬元',
    submission: '商業計畫書 (PDF)',
    details: '這是一個專為青年創業家設計的舞台，提供豐富的資源與人脈。'
  },
  {
    id: '2',
    title: '跨領域人才交流小聚',
    type: '活動',
    date: '2026-04-15',
    description: '與來自不同背景的優秀青年交流，拓展人脈並激盪新火花。',
    link: '#',
    highlight: '拓展人脈並激盪新火花',
    schedule: '2026-04-15 14:00 - 17:00',
    deadline: '2026-04-10',
    fee: '200 元 (含飲品)',
    prize: '參加證書',
    details: '透過輕鬆的對話，發現跨領域合作的可能性。'
  },
  {
    id: '3',
    title: 'Zinker 青年領袖培訓計畫',
    type: '計畫',
    date: '2026-06-01',
    description: '為期三個月的深度培訓，提升領導力、溝通力與專案管理能力。',
    link: '#',
    highlight: '提升領導力、溝通力與專案管理能力',
    schedule: '2026-06-01 至 2026-08-31',
    teamSize: '個人申請',
    deadline: '2026-05-15',
    fee: '免費',
    prize: '結業證書與實習機會',
    details: '專為有志成為未來領袖的青年設計的培訓課程。'
  },
  {
    id: '4',
    title: '2026 數位轉型趨勢論壇',
    type: '資訊分享',
    date: '2026-03-25',
    description: '邀請產業專家分享最新數位科技趨勢，掌握未來職場競爭力。',
    link: '#',
    highlight: '掌握未來職場競爭力',
    schedule: '2026-03-25 09:00 - 12:00',
    deadline: '2026-03-20',
    fee: '免費',
    prize: '無',
    details: '深入了解 AI 與數位轉型對未來職場的影響。'
  }
];

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
  const eventsDatabaseId = process.env.NOTION_EVENTS_DATABASE_ID;

  if (!apiKey || !eventsDatabaseId) {
    return res.status(200).json(fallbackEvents);
  }

  try {
    const notionResponse = await fetch(`https://api.notion.com/v1/databases/${eventsDatabaseId.trim()}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": "2022-02-22",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!notionResponse.ok) {
      return res.status(200).json(fallbackEvents);
    }

    const response: any = await notionResponse.json();
    const events = response.results.map((page: any) => {
      const props = page.properties;
      const getText = (prop: any) => {
        if (!prop) return "";
        if (prop.type === "title") return prop.title[0]?.plain_text || "";
        if (prop.type === "rich_text") return prop.rich_text[0]?.plain_text || "";
        if (prop.type === "url") return prop.url || "";
        if (prop.type === "date") return prop.date?.start || "";
        if (prop.type === "select") return prop.select?.name || "";
        return "";
      };

      return {
        id: page.id,
        title: getText(props.名稱 || props.Name || props.title),
        type: getText(props.類型),
        date: getText(props.日期),
        description: getText(props.簡介),
        link: getText(props.連結),
        highlight: getText(props.亮點),
        schedule: getText(props.時程),
        teamSize: getText(props.隊伍人數),
        deadline: getText(props.截止日期),
        fee: getText(props.費用),
        prize: getText(props.獎勵),
        submission: getText(props.繳交內容),
        details: getText(props.詳細內容)
      };
    });

    res.status(200).json(events);
  } catch (error) {
    res.status(200).json(fallbackEvents);
  }
}
