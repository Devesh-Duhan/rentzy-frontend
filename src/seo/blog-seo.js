import { BLOG_SEO } from './seo.constants.js';
import { buildMetadata, metadataText } from './seo.utils.js';
export const validBlogKey = value => typeof value === 'string' && /^[a-z\d_-]{1,200}$/i.test(value);
export const blogPath = blog => '/blog/' + (validBlogKey(blog.slug) ? blog.slug : String(blog._id).toLowerCase());
export function publicBlog(record, summary=false) {
  if (!record || record.status !== 'published' || !/^[a-f\d]{24}$/i.test(String(record._id)) || typeof record.title !== 'string' || !metadataText(record.title) || typeof record.content !== 'string' && !summary) return null;
  const fields=['_id','title','slug','excerpt','coverImage','categories','tags','status','publishDate','featured','views','readingTime','updatedAt','createdAt','metaTitle','metaDescription','ogImage'];
  const result=Object.fromEntries(fields.filter(key=>record[key]!==undefined).map(key=>[key,record[key]]));
  if (!summary) result.content=record.content;
  result.author={name:typeof record.author?.name==='string'?record.author.name:''};
  return result;
}
export function blogMetadata(blog,key) {
  if (!blog) return buildMetadata({...BLOG_SEO.failure,canonical:'/blog/'+encodeURIComponent(key)});
  return buildMetadata({title:metadataText(blog.metaTitle||blog.title),description:metadataText(blog.metaDescription||blog.excerpt||blog.content).slice(0,BLOG_SEO.descriptionLength),canonical:blogPath(blog),image:blog.ogImage||blog.coverImage,type:'article',robots:{index:true,follow:true}});
}
