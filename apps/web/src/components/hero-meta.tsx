'use client';
import { useEffect, useState } from 'react';

export function HeroMeta() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      const ss = now.getSeconds().toString().padStart(2, '0');
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute top-[12vh] right-[6vw] flex flex-col items-end gap-xs text-white/70 z-10 select-none">
      {/* 第一行：编号 + 年份 */}
      <div className="flex items-center gap-md">
        <span className="font-mono text-[10px] tracking-[0.3em]">N°04</span>
        <span className="w-12 h-[1px] bg-white/30" />
        <span className="font-mono text-[10px] tracking-[0.3em]">2026</span>
      </div>
      {/* 第二行：实时时间 + 位置 */}
      <div className="flex items-center gap-md mt-xs">
        <span className="font-mono text-[10px] tracking-[0.2em] tabular-nums">
          {time} CST
        </span>
        <span className="w-1 h-1 rounded-full bg-vermilion animate-pulse" />
        <span className="font-mono text-[10px] tracking-[0.2em]">SHANGHAI · 31.23°N</span>
      </div>
    </div>
  );
}