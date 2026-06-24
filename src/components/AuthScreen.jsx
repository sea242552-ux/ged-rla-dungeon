import { useState } from 'react';
import { signUp, signIn, resetPassword } from '../lib/supabase';

export default function AuthScreen({ onBack }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error'|'success', text }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setMessage({ type: 'error', text: 'กรุณาใส่ชื่อที่จะแสดง' });
        setBusy(false);
        return;
      }
      const { error } = await signUp(email, password, displayName.trim());
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'success',
          text: 'สมัครสำเร็จ! เช็ค email เพื่อยืนยันบัญชี แล้วกลับมา login',
        });
      }
    } else if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setMessage({ type: 'error', text: error.message });
      else onBack();
    } else if (mode === 'forgot') {
      const { error } = await resetPassword(email);
      if (error) setMessage({ type: 'error', text: error.message });
      else setMessage({ type: 'success', text: 'ส่งลิงค์ reset รหัสผ่านแล้ว เช็ค email' });
    }
    setBusy(false);
  };

  const title = { login: 'เข้าสู่ระบบ', signup: 'สมัครสมาชิก', forgot: 'ลืมรหัสผ่าน' }[mode];

  return (
    <div className="min-h-screen p-4 font-mono">
      <div className="max-w-md mx-auto">

        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm">← Back</button>
          <h2 className="text-lg">{title}</h2>
          <div className="w-12" />
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-lg p-4 mb-4 space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">ชื่อที่จะแสดง</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                maxLength={20}
                className="w-full bg-zinc-800 rounded px-3 py-2 text-white text-sm outline-none"
                placeholder="ชื่อใน leaderboard"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-800 rounded px-3 py-2 text-white text-sm outline-none"
              placeholder="you@example.com"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-zinc-800 rounded px-3 py-2 text-white text-sm outline-none"
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
            </div>
          )}

          {message && (
            <div className={`text-xs p-2 rounded ${
              message.type === 'error' ? 'bg-red-900/40 text-red-300' : 'bg-green-900/40 text-green-300'
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full p-3 bg-amber-700 hover:bg-amber-600 disabled:bg-zinc-700 disabled:text-zinc-500 rounded text-sm"
          >
            {busy ? '...' : title}
          </button>
        </form>

        <div className="text-xs text-zinc-500 text-center space-y-2">
          {mode === 'login' && (
            <>
              <div>
                ยังไม่มีบัญชี?{' '}
                <button onClick={() => { setMode('signup'); setMessage(null); }} className="text-amber-400 hover:text-amber-300">
                  สมัครสมาชิก
                </button>
              </div>
              <div>
                <button onClick={() => { setMode('forgot'); setMessage(null); }} className="text-zinc-400 hover:text-white">
                  ลืมรหัสผ่าน?
                </button>
              </div>
            </>
          )}
          {mode === 'signup' && (
            <div>
              มีบัญชีแล้ว?{' '}
              <button onClick={() => { setMode('login'); setMessage(null); }} className="text-amber-400 hover:text-amber-300">
                เข้าสู่ระบบ
              </button>
            </div>
          )}
          {mode === 'forgot' && (
            <div>
              <button onClick={() => { setMode('login'); setMessage(null); }} className="text-amber-400 hover:text-amber-300">
                กลับไปเข้าสู่ระบบ
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
