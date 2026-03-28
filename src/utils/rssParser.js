export async function parseGoogleNews(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');

    // Check for parse errors
    if (xml.querySelector('parsererror')) return [];

    const items = xml.querySelectorAll('item');
    return Array.from(items).slice(0, 15).map(item => {
      // <link> in RSS is tricky — textContent may include whitespace
      // Fall back to getting text between <link> tags manually
      const linkEl = item.querySelector('link');
      let link = linkEl?.textContent?.trim() || '';
      if (!link) {
        // Try to extract from raw XML
        const itemXml = new XMLSerializer().serializeToString(item);
        const linkMatch = itemXml.match(/<link[^>]*>(.*?)<\/link>/);
        if (linkMatch) link = linkMatch[1];
      }

      return {
        title: item.querySelector('title')?.textContent || '',
        link,
        pubDate: item.querySelector('pubDate')?.textContent || '',
        source: item.querySelector('source')?.textContent || '',
      };
    });
  } catch {
    return [];
  }
}
