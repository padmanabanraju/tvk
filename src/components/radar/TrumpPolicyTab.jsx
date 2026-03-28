import { timeAgo } from '../../utils/format';

export default function TrumpPolicyTab({ articles }) {
  if (!articles || articles.length === 0) {
    return <p className="text-[#666] text-sm py-4">No policy news available</p>;
  }

  return (
    <div className="space-y-1">
      {articles.map((item, i) => {
        const isOld = item.pubDate && (Date.now() - new Date(item.pubDate).getTime() > 86400000);
        return (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`block py-2.5 px-1 border-b border-white/5 ${isOld ? 'opacity-40' : ''}`}
          >
            <div className="text-sm text-[#d0d0dd] leading-snug">{item.title}</div>
            <div className="flex justify-between mt-1 text-xs text-[#666]">
              <span>{item.source || ''}</span>
              <span>{item.pubDate ? timeAgo(item.pubDate) : ''}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
