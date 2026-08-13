import axios from 'axios';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  let blogs = [];
  try {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/blogs`);
    blogs = data?.data || [];
  } catch (e) {
    // Return static feed if API unavailable
  }

  const blogItems = blogs.map(blog => `
    <item>
      <title>${blog.title}</title>
      <link>${baseUrl}/blog</link>
      <description>${blog.excerpt || blog.content?.substring(0, 200) || ''}</description>
      <pubDate>${new Date(blog.createdAt).toUTCString()}</pubDate>
      <guid>${baseUrl}/blog#${blog._id}</guid>
    </item>
  `).join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>rentzypro - Property Blog</title>
    <link>${baseUrl}</link>
    <description>Latest real estate news, tips, and property listings from rentzypro</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${blogItems}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}