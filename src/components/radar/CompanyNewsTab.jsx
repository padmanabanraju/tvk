import { timeAgo } from '../../utils/format';

export default function CompanyNewsTab({ articles }) {
  if (!articles || articles.length === 0) {
    return <p className="text-[#666] text-sm py-4">No company news available</p>;
  }

  return (
    <div className="space-y-1">
      {articles.map((item, i) => {
        const isOld = item.datetime && (Date.now() / 1000 - item.datetime > 86400);
        return (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block py-2.5 px-1 border-b border-white/5 ${isOld ? 'opacity-40' : ''}`}
          >
            <div className="text-sm text-[#d0d0dd] leading-snug">{item.headline}</div>
            <div className="flex justify-between mt-1 text-xs text-[#666]">
              <span>{item.source}</span>
              <span>{item.datetime ? timeAgo(new Date(item.datetime * 1000).toISOString()) : ''}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
