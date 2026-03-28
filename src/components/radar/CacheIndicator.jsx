import { formatAge } from '../../utils/format';

export default function CacheIndicator({ isCached, age }) {
  if (!isCached) {
    return (
      <span className="text-xs text-[#22c55e] font-medium">LIVE</span>
    );
  }
  return (
    <span className="text-xs text-[#f59e0b] font-medium">
      CACHED {age ? formatAge(age) : ''}
    </span>
  );
}
