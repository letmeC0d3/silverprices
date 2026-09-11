interface AdBannerProps {
  slot?: 'leaderboard' | 'rectangle' | 'in-feed';
  className?: string;
}

export default function AdBanner({ slot = 'leaderboard', className = '' }: AdBannerProps) {
  const heightClass =
    slot === 'rectangle'
      ? 'h-[250px]'
      : slot === 'in-feed'
      ? 'h-[120px]'
      : 'h-[90px]';

  return (
    <div
      className={`w-full ${heightClass} bg-slate-100/90 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
      aria-label="Advertisement Banner"
    >
      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold mb-1">
        Advertisement
      </span>
      <p className="text-xs text-slate-500 font-medium max-w-sm">
        Sponsor Space Available &bull; High Intent Indian Commodity &amp; Jewellery Investors
      </p>
    </div>
  );
}
