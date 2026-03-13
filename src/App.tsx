import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar, 
  User, 
  BookOpen, 
  Briefcase, 
  Heart, 
  X, 
  AlertCircle,
  ArrowRight,
  MapPin,
  Clock,
  Loader2,
  Instagram,
  MessageCircle,
  Mail,
  Trophy,
  Share2,
  Home,
  Copy,
  CheckCircle2,
  Lock,
  LogIn,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, safeFetch } from './lib/api';

interface Profile {
  id: string;
  name: string;
  nickname?: string;
  title: string;
  age?: number;
  bio: string;
  experience?: string;
  skills: string[];
  skillsSupplement?: string;
  interests: string[];
  interestsSupplement?: string;
  website: string;
  introducer?: string;
  date?: string;
  code?: string;
}

interface EventItem {
  id: string;
  title: string;
  type: '活動' | '比賽' | '計畫' | '資訊分享';
  date: string;
  description: string;
  link: string;
  highlight?: string;
  schedule?: string;
  teamSize?: string;
  deadline?: string;
  fee?: string;
  prize?: string;
  submission?: string;
  details?: string;
}

const ZinkerLogo = () => (
  <div className="flex items-center">
    <img 
      src="https://storage.googleapis.com/a1aa/image/zinker_logo_placeholder.png" 
      alt="Zinker Logo" 
      className="h-16 w-auto object-contain"
      referrerPolicy="no-referrer"
    />
  </div>
);


  const EventDetail = ({ event, onBack, isLoggedIn, onLogin }: { event: EventItem, onBack: () => void, isLoggedIn: boolean, onLogin: () => void }) => {
  const DetailItem = ({ label, value, icon: Icon, blur }: { label: string, value?: string, icon: any, blur?: boolean }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-[#0047AB]/5 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-[#0047AB]" />
        </div>
        <div className={blur ? "blur-sm select-none" : ""}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
          <p className="text-slate-900 font-bold leading-tight">{value}</p>
        </div>
        {blur && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
            <Lock className="w-4 h-4 text-[#0047AB]/30" />
          </div>
        )}
      </div>
    );
  };

  const renderTemplate = () => {
    return (
      <div className="space-y-10">
        {/* Highlight Section */}
        {event.highlight && (
          <div className="relative p-8 bg-[#0047AB] rounded-[32px] overflow-hidden shadow-lg shadow-[#0047AB]/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">一句話亮點</p>
              <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
                {event.highlight}
              </h3>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="名稱" value={event.title} icon={Briefcase} />
          <DetailItem label={event.type === '比賽' ? '比賽時程' : event.type === '活動' ? '活動時程' : '計畫時程'} value={event.schedule || event.date} icon={Calendar} />
          {event.teamSize && <DetailItem label="隊伍人數" value={event.teamSize} icon={Users} />}
          <DetailItem label={event.type === '計畫' ? '申請截止' : '報名截止'} value={event.deadline} icon={Clock} />
          <DetailItem label={event.type === '計畫' ? '申請費用' : '報名費'} value={event.fee} icon={Copy} />
          {event.prize && <DetailItem label={event.type === '比賽' ? '獎金' : event.type === '活動' ? '獎勵 / 證書' : '補助金額'} value={event.prize} icon={Trophy} />}
          {event.submission && <DetailItem label="初賽繳交" value={event.submission} icon={BookOpen} />}
          <DetailItem label="報名網址" value={isLoggedIn ? event.link : "登入後解鎖連結"} icon={Share2} blur={!isLoggedIn} />
        </div>

        {/* Details Section */}
        {event.details && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-grow bg-slate-200" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">亮點詳情</h4>
              <div className="h-px flex-grow bg-slate-200" />
            </div>
            <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 relative overflow-hidden">
              <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-lg">
                {event.details}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-slate-400 hover:text-[#0047AB] hover:shadow-md font-bold transition-all border border-slate-100"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> 返回列表
        </button>
        
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
            event.type === '比賽' ? 'bg-amber-100 text-amber-600' :
            event.type === '活動' ? 'bg-blue-100 text-blue-600' :
            event.type === '計畫' ? 'bg-emerald-100 text-emerald-600' :
            'bg-slate-100 text-slate-600'
          }`}>
            {event.type}
          </span>
        </div>
      </div>

      <div className="bg-white p-8 md:p-16 rounded-[48px] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-12">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {event.title}
          </h2>
          <div className="flex items-center justify-center gap-4 text-slate-400 font-bold text-sm">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {event.date}</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full" />
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> 全球/線上</span>
          </div>
        </div>

        {renderTemplate()}

        <div className="pt-12 flex flex-col items-center gap-6">
          {isLoggedIn ? (
            <a 
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-16 py-5 bg-[#0047AB] text-white rounded-2xl font-black text-xl hover:bg-[#003580] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#0047AB]/30 flex items-center justify-center gap-3"
            >
              立即報名參加
              <ArrowRight className="w-6 h-6" />
            </a>
          ) : (
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto px-16 py-5 bg-[#0047AB] text-white rounded-2xl font-black text-xl hover:bg-[#003580] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#0047AB]/30 flex items-center justify-center gap-3"
            >
              登入以報名
              <Lock className="w-6 h-6" />
            </button>
          )}
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            {isLoggedIn ? '點擊按鈕將導向外部報名網頁' : '登入後即可解鎖報名連結'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'events' | 'admin' | 'join'>('home');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [selectedInterest, setSelectedInterest] = useState<string>('All');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Event states
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventSearch, setEventSearch] = useState('');
  const [eventCategory, setEventCategory] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Chat states
  const [chatProfile, setChatProfile] = useState<Profile | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Admin states
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminProfiles, setAdminProfiles] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminTab, setAdminTab] = useState<'talents' | 'events' | 'chats'>('talents');
  const [chatRequests, setChatRequests] = useState<any[]>([]);
  const [isFetchingChats, setIsFetchingChats] = useState(false);

  const fetchChatRequests = async () => {
    if (!adminPassword) return;
    setIsFetchingChats(true);
    try {
      const response = await safeFetch(api('/api/admin/chats'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await response.json();
      if (response.ok) setChatRequests(data);
    } catch (err) {
      console.error('Failed to fetch chat requests');
    } finally {
      setIsFetchingChats(false);
    }
  };

  useEffect(() => {
    if (adminTab === 'chats' && isAdminAuthenticated) {
      fetchChatRequests();
    }
  }, [adminTab, isAdminAuthenticated]);

  const handleUpdateChatStatus = async (chatId: string, newStatus: string) => {
    try {
      const response = await safeFetch(api(`/api/admin/chats/update?id=${chatId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword, status: newStatus })
      });
      if (response.ok) {
        fetchChatRequests();
      }
    } catch (err) {
      alert('更新失敗');
    }
  };

  // Auth states
  const [userCode, setUserCode] = useState<string | null>(localStorage.getItem('zinker_user_code'));
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const isLoggedIn = !!userCode;

  const SuccessModal = () => (
    <AnimatePresence>
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">建檔成功！</h3>
            <p className="text-slate-500 mb-8">這是您的專屬登入編碼，請務必妥善保存，未來登入全靠它。</p>
            
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-8 relative group">
              <p className="text-3xl font-black tracking-widest text-[#0047AB]">{generatedCode}</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  setIsCopying(true);
                  setTimeout(() => setIsCopying(false), 2000);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-xl transition-all shadow-sm"
              >
                {isCopying ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
              </button>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  handleLogin(generatedCode);
                }}
                className="w-full py-4 bg-[#0047AB] text-white rounded-2xl font-black text-lg hover:bg-[#003580] transition-all"
              >
                立即登入解鎖
              </button>
              <button 
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                返回首頁
              </button>
            </div>
            <p className="mt-6 text-xs text-slate-400">若遺失編碼，請聯繫管理員處理。</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const LoginModal = () => (
    <AnimatePresence>
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLoginModalOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900">編碼登入</h3>
              <button onClick={() => setIsLoginModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">您的專屬編碼</label>
                <input 
                  type="text" 
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value.toUpperCase())}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#0047AB] outline-none font-black text-xl tracking-widest text-center"
                  placeholder="例如：A7K9P3XQ"
                />
              </div>

              {loginError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {loginError}
                </div>
              )}

              <button 
                onClick={() => handleLogin(loginInput)}
                disabled={loginLoading || !loginInput}
                className="w-full py-4 bg-[#0047AB] text-white rounded-2xl font-black text-lg hover:bg-[#003580] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '登入解鎖'}
              </button>

              <div className="text-center space-y-4">
                <p className="text-sm text-slate-500">
                  尚未建立個人檔案？ 
                  <a 
                    href="https://noteforms.com/forms/zinker-gyr0ob"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      setIsLoginModalOpen(false);
                    }}
                    className="text-[#0047AB] font-bold ml-1 hover:underline"
                  >
                    立即建檔
                  </a>
                </p>
                <button 
                  onClick={() => alert('若您忘記編碼，請聯繫 Zinker 管理員或透過官方 LINE 帳號提供您的真實姓名與學校資訊，我們將協助您找回編碼。')}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  忘記編碼？聯繫管理員
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // New Profile Form State
  const [newProfile, setNewProfile] = useState({
    name: '',
    nickname: '',
    title: '',
    bio: '',
    experience: '',
    website: '',
    introducer: '',
    skillsSupplement: '',
    interestsSupplement: ''
  });

  // Check login status on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('zinker_user_code');
    if (savedCode) {
      handleLogin(savedCode, true);
    }
  }, []);

  const handleLogin = async (code: string, isAuto = false) => {
    if (!isAuto) setLoginLoading(true);
    setLoginError('');
    try {
      const res = await safeFetch(api('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        setUserCode(code);
        setCurrentUser(data.profile);
        localStorage.setItem('zinker_user_code', code);
        setIsLoginModalOpen(false);
      } else {
        if (!isAuto) setLoginError(data.error || '登入失敗');
        if (isAuto) handleLogout();
      }
    } catch (err) {
      if (!isAuto) setLoginError('連線失敗，請稍後再試');
    } finally {
      if (!isAuto) setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setUserCode(null);
    setCurrentUser(null);
    localStorage.removeItem('zinker_user_code');
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await safeFetch(api('/api/profiles/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profile: { 
            ...newProfile,
            skills: selectedSkills,
            interests: selectedInterests
          } 
        }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedCode(data.code);
        setIsSuccessModalOpen(true);
        setCurrentPage('home');
        fetchProfiles();
      } else {
        alert(data.error || '報名失敗，請稍後再試');
      }
    } catch (err) {
      alert('網路錯誤');
    } finally {
      setIsUpdating(false);
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    setIsUpdating(true);
    try {
      const response = await safeFetch(api(`/api/admin/profiles/${editingProfile.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password: adminPassword,
          updates: editingProfile 
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Update failed');
      
      // Refresh admin profiles
      const refreshResponse = await safeFetch(api('/api/admin/profiles'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      const refreshedData = await refreshResponse.json();
      setAdminProfiles(refreshedData);
      setEditingProfile(null);
      alert('資料更新成功！');
      fetchProfiles(); // Also refresh public profiles
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await safeFetch(api(`/api/profiles?t=${Date.now()}`));
      const data = await response.json();
      if (response.ok) {
        setProfiles(data);
      } else {
        setError(data.error || '無法載入人才資料');
      }
    } catch (err) {
      setError('連線錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await safeFetch(api('/api/events'));
      const data = await response.json();
      if (response.ok) setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events');
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchEvents();
  }, []);

  const [chatPurpose, setChatPurpose] = useState('交流');

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!chatProfile || !chatMessage.trim()) return;
    setIsSendingChat(true);
    try {
      const response = await safeFetch(api('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fromCode: userCode,
          toCode: chatProfile.code,
          message: chatMessage,
          purpose: chatPurpose
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setChatProfile(null);
        setChatMessage('');
        setChatPurpose('交流');
      } else {
        alert(data.error || '發送失敗');
      }
    } catch (err) {
      alert('發送失敗');
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleAdminEventUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setIsUpdating(true);
    try {
      let newEvents;
      if (events.find(ev => ev.id === editingEvent.id)) {
        newEvents = events.map(ev => ev.id === editingEvent.id ? editingEvent : ev);
      } else {
        newEvents = [...events, { ...editingEvent, id: Date.now().toString() }];
      }

      const response = await safeFetch(api('/api/admin/events'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword, newEvents }),
      });
      if (response.ok) {
        setEvents(newEvents);
        setEditingEvent(null);
        alert('活動資訊更新成功！');
      }
    } catch (err) {
      alert('更新失敗');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdminEventDelete = async (id: string) => {
    if (!confirm('確定要刪除此活動嗎？')) return;
    const newEvents = events.filter(ev => ev.id !== id);
    try {
      const response = await safeFetch(api('/api/admin/events'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword, newEvents }),
      });
      if (response.ok) {
        setEvents(newEvents);
        alert('活動已刪除');
      }
    } catch (err) {
      alert('刪除失敗');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      const response = await safeFetch(api('/api/admin/profiles'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setAdminProfiles(data);
        setIsAdminAuthenticated(true);
      } else {
        alert(data.error || '密碼錯誤');
      }
    } catch (err) {
      alert('登入失敗，請檢查網路連線');
    } finally {
      setAdminLoading(false);
    }
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.nickname && p.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bio.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSkill = selectedSkill === 'All' || p.skills.includes(selectedSkill);
      const matchesInterest = selectedInterest === 'All' || p.interests.includes(selectedInterest);
      return matchesSearch && matchesSkill && matchesInterest;
    });
  }, [profiles, searchTerm, selectedSkill, selectedInterest]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = 
        e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
        e.description.toLowerCase().includes(eventSearch.toLowerCase());
      const matchesCategory = eventCategory === 'All' || e.type === eventCategory;
      return matchesSearch && matchesCategory;
    });
  }, [eventSearch, eventCategory]);

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    profiles.forEach(p => p.skills.forEach(s => skills.add(s)));
    return ['All', ...Array.from(skills)];
  }, [profiles]);

  const allInterests = useMemo(() => {
    const interests = new Set<string>();
    profiles.forEach(p => p.interests.forEach(i => interests.add(i)));
    return ['All', ...Array.from(interests)];
  }, [profiles]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#FFC107]/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between gap-2">
          <div className="flex-1 flex justify-start">
            <button onClick={() => setCurrentPage('home')} className="hover:opacity-80 transition-opacity shrink-0">
              <div className="scale-75 sm:scale-100 origin-left">
                <ZinkerLogo />
              </div>
            </button>
          </div>
          
          <nav className="hidden sm:flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${currentPage === 'home' ? 'bg-white text-[#0047AB] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              人才庫
            </button>
            <button 
              onClick={() => setCurrentPage('events')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${currentPage === 'events' ? 'bg-white text-[#0047AB] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              活動與比賽
            </button>
          </nav>

          {/* Mobile Navigation - Pill Style */}
          <nav className="flex sm:hidden items-center bg-slate-100/50 p-0.5 rounded-xl border border-slate-200/50">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${currentPage === 'home' ? 'bg-white text-[#0047AB] shadow-sm' : 'text-slate-400'}`}
            >
              人才庫
            </button>
            <button 
              onClick={() => setCurrentPage('events')}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition-all whitespace-nowrap ${currentPage === 'events' ? 'bg-white text-[#0047AB] shadow-sm' : 'text-slate-400'}`}
            >
              活動與比賽資訊
            </button>
          </nav>

          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4 shrink-0">
            <button 
              onClick={fetchProfiles}
              disabled={loading}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-[#0047AB]"
              title="重新整理資料"
            >
              <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-[#0047AB] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0047AB]">已登入</p>
                    <p className="text-xs font-black text-slate-900">{userCode}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                  title="登出"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-2.5 bg-[#0047AB] text-white rounded-2xl font-black text-sm hover:bg-[#003580] transition-all shadow-lg shadow-[#0047AB]/20 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> 登入
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {currentPage === 'home' ? (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047AB]/5 rounded-full text-[#0047AB] text-xs font-black uppercase tracking-widest border border-[#0047AB]/10">
                  <Users className="w-3 h-3" /> 目前共有 {profiles.length} 位青年
                </div>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Zinker <br className="md:hidden" /> <span className="text-[#0047AB]">青年人才庫</span>
              </h1>
              <div className="space-y-2">
                <p className="text-2xl text-slate-700 font-bold">
                  跨出同溫層 連結多元人才
                </p>
                <p className="text-lg text-slate-500 font-medium italic leading-relaxed md:whitespace-nowrap">
                  Connecting Potential. <br className="md:hidden" /> Unlocking Possibility.
                </p>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                {!isLoggedIn ? (
                  <a 
                    href="https://noteforms.com/forms/zinker-gyr0ob"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-5 bg-[#0047AB] text-white rounded-3xl font-black text-xl transition-all shadow-2xl shadow-[#0047AB]/30 group hover:bg-[#003580] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-left leading-tight">
                        <span className="block text-sm opacity-80 font-bold mb-0.5">建立個人檔案</span>
                        <span className="block">以解鎖全部功能</span>
                      </div>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="px-8 py-4 bg-blue-50 text-[#0047AB] rounded-2xl font-black text-lg border-2 border-blue-100 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6" />
                      您已登入解鎖
                    </div>
                    <p className="text-slate-400 text-sm font-bold">歡迎回來，您可以自由瀏覽人才庫與活動詳情</p>
                  </div>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="搜尋姓名、校系或關鍵字..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] outline-none transition-all text-lg font-medium"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">能力篩選</label>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl appearance-none outline-none focus:border-[#0047AB] font-bold text-slate-700"
                    >
                      {allSkills.map(skill => (
                        <option key={skill} value={skill}>{skill === 'All' ? '所有能力' : skill}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">興趣領域篩選</label>
                  <div className="relative">
                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={selectedInterest}
                      onChange={(e) => setSelectedInterest(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl appearance-none outline-none focus:border-[#0047AB] font-bold text-slate-700"
                    >
                      {allInterests.map(interest => (
                        <option key={interest} value={interest}>{interest === 'All' ? '所有興趣' : interest}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Profiles Grid */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-[#0047AB] animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse">正在為您載入青年人才庫...</p>
              </div>
            ) : error ? (
              <div className="py-24 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <p className="text-slate-900 font-bold">{error}</p>
                <button onClick={fetchProfiles} className="text-[#0047AB] font-bold underline">重新整理</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProfiles.map((profile) => (
                  <motion.div 
                    layout
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile)}
                    className="group bg-white p-8 rounded-[40px] border border-slate-200 hover:border-[#0047AB] hover:shadow-xl hover:shadow-[#0047AB]/5 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
                  >
                    <div className="space-y-6 flex-grow">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#0047AB] bg-[#0047AB]/5 px-3 py-1 rounded-full">
                            {profile.title.split('/')[0]}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0047AB] group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#0047AB] transition-colors">
                          {profile.nickname || profile.name}
                        </h3>
                        <p className="text-sm text-slate-500 font-bold mt-1">{profile.title}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">自我介紹</h4>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 font-medium">
                          {profile.bio || "尚未填寫"}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">能力類別</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.skills.length > 0 ? profile.skills.slice(0, 4).map(skill => (
                              <span key={skill} className="px-2.5 py-1 bg-blue-50 text-[#0047AB] text-[10px] font-bold rounded-lg border border-blue-100">
                                {skill}
                              </span>
                            )) : <span className="text-[10px] text-slate-400 font-medium">尚未填寫</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLoggedIn) {
                            setIsLoginModalOpen(true);
                            return;
                          }
                          setChatProfile(profile);
                        }}
                        className="flex-1 py-2 bg-[#0047AB]/10 text-[#0047AB] rounded-xl text-xs font-bold hover:bg-[#0047AB] hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        {isLoggedIn ? <MessageCircle className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />} 聊聊
                      </button>
                      <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-[#0047AB] transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : currentPage === 'join' ? (
          <div className="max-w-3xl mx-auto py-12 px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 md:p-12 rounded-[40px] border border-slate-200 shadow-xl"
            >
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-[#0047AB]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <User className="w-10 h-10 text-[#0047AB]" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4">加入 Zinker 人才庫</h1>
                <p className="text-slate-500 font-medium">填寫您的個人資料，讓更多優秀人才看見您。</p>
              </div>

                <form onSubmit={handleJoinSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">真實姓名 *</label>
                      <input 
                        required
                        type="text" 
                        value={newProfile.name}
                        onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#0047AB] outline-none font-bold"
                        placeholder="例如：王小明"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">暱稱</label>
                      <input 
                        type="text" 
                        value={newProfile.nickname}
                        onChange={(e) => setNewProfile({...newProfile, nickname: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#0047AB] outline-none font-bold"
                        placeholder="例如：小明"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">學校/系 *</label>
                    <input 
                      required
                      type="text" 
                      value={newProfile.title}
                      onChange={(e) => setNewProfile({...newProfile, title: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#0047AB] outline-none font-bold"
                      placeholder="例如：台灣大學 資訊工程系"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">自我介紹 *</label>
                    <textarea 
                      required
                      rows={4}
                      value={newProfile.bio}
                      onChange={(e) => setNewProfile({...newProfile, bio: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#0047AB] outline-none font-bold resize-none"
                      placeholder="簡單介紹一下您自己..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">過往經歷</label>
                    <textarea 
                      rows={4}
                      value={newProfile.experience}
                      onChange={(e) => setNewProfile({...newProfile, experience: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#0047AB] outline-none font-bold resize-none"
                      placeholder="列出您的實習、工作或社團經驗..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">作品集/個人網站</label>
                      <input 
                        type="url" 
                        value={newProfile.website}
                        onChange={(e) => setNewProfile({...newProfile, website: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#0047AB] outline-none font-bold"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">介紹人</label>
                      <input 
                        type="text" 
                        value={newProfile.introducer}
                        onChange={(e) => setNewProfile({...newProfile, introducer: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#0047AB] outline-none font-bold"
                        placeholder="是誰介紹您加入的？"
                      />
                    </div>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setCurrentPage('home')}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all"
                    >
                      取消
                    </button>
                    <button 
                      type="submit"
                      disabled={isUpdating}
                      className="flex-[2] py-4 bg-[#0047AB] text-white rounded-2xl font-black text-lg hover:bg-[#003580] transition-all shadow-xl shadow-[#0047AB]/20 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : '確認送出'}
                    </button>
                  </div>
                </form>
            </motion.div>
          </div>
        ) : currentPage === 'events' ? (
          <div className="space-y-12">
            {selectedEvent ? (
              <EventDetail 
                event={selectedEvent} 
                onBack={() => setSelectedEvent(null)} 
                isLoggedIn={isLoggedIn}
                onLogin={() => setIsLoginModalOpen(true)}
              />
            ) : (
              <>
                <div className="text-center max-w-3xl mx-auto space-y-6">
                  <h1 className="text-3xl md:text-6xl font-black text-[#0047AB] tracking-tight whitespace-nowrap">
                    活動與比賽資訊
                  </h1>
                  <p className="text-lg text-slate-500 font-medium">
                    掌握最新的青年活動、商業競賽與實習計畫，開啟你的無限可能。
                  </p>
                </div>

                {/* Event Filters */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="搜尋活動名稱或內容..."
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] outline-none transition-all text-lg font-medium"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {['All', '比賽', '活動', '計畫', '資訊分享'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setEventCategory(cat)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          eventCategory === cat 
                            ? 'bg-[#0047AB] text-white shadow-lg shadow-[#0047AB]/20' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {cat === 'All' ? '全部類別' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredEvents.map((event) => (
                    <motion.div 
                      layout
                      key={event.id}
                      className="group bg-white p-8 rounded-[40px] border border-slate-200 hover:border-[#0047AB] hover:shadow-xl transition-all flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          event.type === '比賽' ? 'bg-amber-100 text-amber-600' :
                          event.type === '活動' ? 'bg-blue-100 text-blue-600' :
                          event.type === '計畫' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {event.type}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                          <Calendar className="w-3.5 h-3.5" />
                          {event.date}
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-[#0047AB] transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium flex-grow">
                        {event.description}
                      </p>
                      <button 
                        onClick={() => setSelectedEvent(event)}
                        className="inline-flex items-center gap-2 text-[#0047AB] font-black text-sm group/link"
                      >
                        查看詳情 <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {!isAdminAuthenticated ? (
              <div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 bg-[#0047AB]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-8 h-8 text-[#0047AB]" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">管理後台登入</h2>
                <p className="text-slate-500 mb-8">請輸入管理員密碼以存取並修改人才資訊。</p>
                <form onSubmit={handleAdminLogin} className="max-w-sm mx-auto space-y-4">
                  <input 
                    type="password"
                    placeholder="管理員密碼"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={adminLoading}
                    className="w-full py-4 bg-[#0047AB] text-white rounded-2xl font-bold hover:bg-[#003580] transition-colors disabled:opacity-50"
                  >
                    {adminLoading ? '驗證中...' : '登入後台'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setAdminTab('talents')}
                      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminTab === 'talents' ? 'bg-[#0047AB] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                      人才管理
                    </button>
                    <button 
                      onClick={() => setAdminTab('events')}
                      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminTab === 'events' ? 'bg-[#0047AB] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                      活動與比賽管理
                    </button>
                    <button 
                      onClick={() => setAdminTab('chats')}
                      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminTab === 'chats' ? 'bg-[#0047AB] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                      聊聊請求管理
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsAdminAuthenticated(false)}
                    className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors"
                  >
                    登出後台
                  </button>
                </div>

                {adminTab === 'talents' ? (
                  <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">真實姓名</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">暱稱</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">專屬編碼</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminProfiles.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-slate-900">{p.realName}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{p.nickname}</td>
                            <td className="px-6 py-4 text-sm font-mono font-black text-[#0047AB]">{p.code || '無資料'}</td>
                            <td className="px-6 py-4 text-sm text-right">
                              <button 
                                onClick={() => setEditingProfile(p)}
                                className="px-4 py-1.5 bg-[#0047AB]/10 text-[#0047AB] rounded-lg font-bold hover:bg-[#0047AB] hover:text-white transition-all"
                              >
                                修改
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : adminTab === 'events' ? (
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setEditingEvent({ id: '', title: '', type: '活動', date: '', description: '', link: '' })}
                        className="px-6 py-2 bg-[#0047AB] text-white rounded-xl text-sm font-bold hover:bg-[#003580] transition-all"
                      >
                        新增活動
                      </button>
                    </div>
                    <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">活動名稱</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">類別</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">日期</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {events.map((ev) => (
                            <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 text-sm font-bold text-slate-900">{ev.title}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">{ev.type}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">{ev.date}</td>
                              <td className="px-6 py-4 text-sm text-right space-x-2">
                                <button 
                                  onClick={() => setEditingEvent(ev)}
                                  className="px-4 py-1.5 bg-[#0047AB]/10 text-[#0047AB] rounded-lg font-bold hover:bg-[#0047AB] hover:text-white transition-all"
                                >
                                  修改
                                </button>
                                <button 
                                  onClick={() => handleAdminEventDelete(ev.id)}
                                  className="px-4 py-1.5 bg-red-50 text-red-500 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-all"
                                >
                                  刪除
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-lg font-black text-slate-900">聊聊請求列表</h3>
                      <button onClick={fetchChatRequests} className="p-2 hover:bg-white rounded-xl transition-all">
                        <Loader2 className={`w-5 h-5 text-[#0047AB] ${isFetchingChats ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">發送者 (Code)</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">接收者 (Code)</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">目的</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">狀態</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">時間</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {chatRequests.length > 0 ? chatRequests.map((chat) => (
                            <tr key={chat.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900">{chat.fromCode}</td>
                              <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900">{chat.toCode}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold">{chat.purpose}</span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <select 
                                  value={chat.status}
                                  onChange={(e) => handleUpdateChatStatus(chat.id, e.target.value)}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-bold border-none outline-none ${
                                    chat.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                    chat.status === 'reviewed' ? 'bg-blue-100 text-blue-600' :
                                    chat.status === 'contacted' ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  <option value="pending">待處理</option>
                                  <option value="reviewed">已審閱</option>
                                  <option value="contacted">已聯繫</option>
                                  <option value="closed">已結案</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 text-[10px] text-slate-400">{new Date(chat.createdAt).toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm text-right">
                                <button 
                                  onClick={() => alert(`訊息內容：\n${chat.message}`)}
                                  className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-all"
                                >
                                  查看內容
                                </button>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">尚無聊聊請求</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Chat Modal */}
      <AnimatePresence>
        {chatProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatProfile(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">聊聊內容簡述</h3>
                <button onClick={() => setChatProfile(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleChatSend} className="p-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-500 font-medium">
                    正在與 <span className="text-[#0047AB] font-bold">{chatProfile.nickname || chatProfile.name}</span> 聯繫
                  </p>
                  <textarea 
                    rows={6}
                    placeholder="請簡述您想聊聊的內容..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] transition-all resize-none"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSendingChat}
                  className="w-full py-4 bg-[#0047AB] text-white rounded-2xl font-bold hover:bg-[#003580] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSendingChat ? <Loader2 className="w-5 h-5 animate-spin" /> : '發送'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Event Edit Modal */}
      <AnimatePresence>
        {editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingEvent(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">{editingEvent.id ? '修改活動' : '新增活動'}</h3>
                <button onClick={() => setEditingEvent(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleAdminEventUpdate} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">活動名稱</label>
                    <input 
                      type="text" 
                      value={editingEvent.title} 
                      onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">類別</label>
                    <select 
                      value={editingEvent.type} 
                      onChange={(e) => setEditingEvent({...editingEvent, type: e.target.value as any})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB]"
                    >
                      <option value="活動">活動</option>
                      <option value="比賽">比賽</option>
                      <option value="計畫">計畫</option>
                      <option value="資訊分享">資訊分享</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">日期</label>
                    <input 
                      type="date" 
                      value={editingEvent.date} 
                      onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">連結</label>
                    <input 
                      type="text" 
                      value={editingEvent.link} 
                      onChange={(e) => setEditingEvent({...editingEvent, link: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">描述</label>
                  <textarea 
                    rows={4}
                    value={editingEvent.description} 
                    onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB] resize-none"
                    required
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    disabled={isUpdating}
                    className="flex-2 py-3 bg-[#0047AB] text-white rounded-xl font-bold hover:bg-[#003580] transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? '儲存中...' : '儲存變更'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Edit Modal */}
      <AnimatePresence>
        {editingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProfile(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">修改人才資料</h3>
                <button onClick={() => setEditingProfile(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleAdminUpdate} className="flex-grow overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">真實姓名</label>
                    <input 
                      type="text" 
                      value={editingProfile.realName} 
                      onChange={(e) => setEditingProfile({...editingProfile, realName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">暱稱</label>
                    <input 
                      type="text" 
                      value={editingProfile.nickname} 
                      onChange={(e) => setEditingProfile({...editingProfile, nickname: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">學校/系</label>
                    <input 
                      type="text" 
                      value={editingProfile.title} 
                      onChange={(e) => setEditingProfile({...editingProfile, title: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">年齡</label>
                    <input 
                      type="number" 
                      value={editingProfile.age} 
                      onChange={(e) => setEditingProfile({...editingProfile, age: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">自我介紹</label>
                  <textarea 
                    rows={3}
                    value={editingProfile.bio} 
                    onChange={(e) => setEditingProfile({...editingProfile, bio: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">過往經歷</label>
                  <textarea 
                    rows={4}
                    value={editingProfile.experience} 
                    onChange={(e) => setEditingProfile({...editingProfile, experience: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB] resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">聯絡方式</label>
                    <input 
                      type="text" 
                      value={editingProfile.contact} 
                      onChange={(e) => setEditingProfile({...editingProfile, contact: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">能力補充</label>
                    <input 
                      type="text" 
                      value={editingProfile.skillsSupplement || ""} 
                      onChange={(e) => setEditingProfile({...editingProfile, skillsSupplement: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">興趣補充</label>
                    <input 
                      type="text" 
                      value={editingProfile.interestsSupplement || ""} 
                      onChange={(e) => setEditingProfile({...editingProfile, interestsSupplement: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">作品集連結</label>
                    <input 
                      type="text" 
                      value={editingProfile.website || ""} 
                      onChange={(e) => setEditingProfile({...editingProfile, website: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">專屬編碼 (登入憑證)</label>
                    <input 
                      type="text" 
                      value={editingProfile.code || ""} 
                      onChange={(e) => setEditingProfile({...editingProfile, code: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB] font-mono font-bold"
                      placeholder="例如: A7K9P3XQ"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">介紹人</label>
                    <input 
                      type="text" 
                      value={editingProfile.introducer || ""} 
                      onChange={(e) => setEditingProfile({...editingProfile, introducer: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0047AB]"
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingProfile(null)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    disabled={isUpdating}
                    className="flex-2 py-3 bg-[#0047AB] text-white rounded-xl font-bold hover:bg-[#003580] transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? '更新中...' : '儲存變更'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfile(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header - Shrinked as requested */}
              <div className="p-5 md:p-6 bg-gradient-to-br from-[#0047AB] to-[#003580] text-white relative">
                <button 
                  onClick={() => setSelectedProfile(null)}
                  className="absolute top-5 right-5 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/20">
                        {selectedProfile.age ? `${selectedProfile.age} 歲` : '青年人才'}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                      {selectedProfile.nickname || selectedProfile.name}
                    </h2>
                    <p className="text-sm text-white/80 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 opacity-60" />
                      {selectedProfile.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Content - Full detailed display */}
              <div className="flex-grow overflow-y-auto p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0047AB] mb-3 flex items-center gap-2">
                        <User className="w-3 h-3" /> 自我介紹
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedProfile.bio || '尚未填寫。'}
                      </p>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0047AB] mb-3 flex items-center gap-2">
                        <Briefcase className="w-3 h-3" /> 過往經歷
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedProfile.experience || '尚未填寫。'}
                      </p>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0047AB] mb-3 flex items-center gap-2">
                        <BookOpen className="w-3 h-3" /> 能力類別
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {Array.isArray(selectedProfile.skills) && selectedProfile.skills.map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-white text-[#0047AB] text-[10px] font-bold rounded-lg shadow-sm border border-blue-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                      {selectedProfile.skillsSupplement && (
                        <p className="text-[10px] text-slate-500 italic">
                          補充：{selectedProfile.skillsSupplement}
                        </p>
                      )}
                    </section>

                    <section className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
                        <Heart className="w-3 h-3" /> 感興趣領域
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {Array.isArray(selectedProfile.interests) && selectedProfile.interests.map(interest => (
                          <span key={interest} className="px-2.5 py-1 bg-white text-amber-600 text-[10px] font-bold rounded-lg shadow-sm border border-amber-100">
                            {interest}
                          </span>
                        ))}
                      </div>
                      {selectedProfile.interestsSupplement && (
                        <p className="text-[10px] text-slate-500 italic">
                          補充：{selectedProfile.interestsSupplement}
                        </p>
                      )}
                    </section>
                  </div>
                </div>
                
                <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center">
                  <button 
                    onClick={() => {
                      if (!isLoggedIn) {
                        setSelectedProfile(null);
                        setIsLoginModalOpen(true);
                        return;
                      }
                      setChatProfile(selectedProfile);
                      setSelectedProfile(null);
                    }}
                    className="px-12 py-4 bg-[#0047AB] text-white rounded-2xl font-black text-lg hover:bg-[#003580] transition-all shadow-xl shadow-[#0047AB]/20 flex items-center gap-3"
                  >
                    {isLoggedIn ? <MessageCircle className="w-6 h-6" /> : <Lock className="w-6 h-6" />} 聊聊
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="md:col-span-1">
              <ZinkerLogo />
              <p className="mt-6 text-slate-500 leading-relaxed max-w-xs">
                Zinker 致力於連結全台優秀青年，打造跨領域的人才交流與成長平台。
              </p>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">聯絡我們</h4>
                <div className="flex flex-col gap-4">
                  <a href="mailto:zinker.youth@gmail.com" className="flex items-center gap-4 text-slate-500 hover:text-[#0047AB] transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#0047AB]/10 transition-colors shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">zinker.youth@gmail.com</span>
                  </a>
                  <a href="https://instagram.com/zinker.youth" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-500 hover:text-[#0047AB] transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#0047AB]/10 transition-colors shrink-0">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">zinker.youth</span>
                  </a>
                  <a href="https://lin.ee/yqxsesK" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-500 hover:text-[#0047AB] transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#0047AB]/10 transition-colors shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Line: @291xusgp</span>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">快速連結</h4>
                <div className="flex flex-col gap-4">
                  <button onClick={() => setCurrentPage('home')} className="text-left text-sm font-medium text-slate-500 hover:text-[#0047AB] transition-colors">人才庫首頁</button>
                  <button onClick={() => setCurrentPage('events')} className="text-left text-sm font-medium text-slate-500 hover:text-[#0047AB] transition-colors">活動與比賽資訊</button>
                  <button onClick={() => setCurrentPage('admin')} className="text-left text-sm font-medium text-slate-500 hover:text-[#0047AB] transition-colors">管理員後台</button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-xs font-medium">
              © 2026 Zinker 青年人才庫. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Designed for Excellence</span>
            </div>
          </div>
        </div>
      </footer>

      <SuccessModal />
      <LoginModal />
    </div>
  );
}
