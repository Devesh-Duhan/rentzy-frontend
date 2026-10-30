import { SITE_SEO, STRUCTURED_SEO } from './seo.constants.js';
import { metadataText, canonicalUrl } from './seo.utils.js';
import { isPublicListing } from './property-seo.js';
import { publicBlog, blogPath } from './blog-seo.js';

const base = SITE_SEO.baseUrl;
const organizationId = base + '/#organization';
const websiteId = base + '/#website';
const context = 'https://schema.org';
const graph = nodes => ({ '@context': context, '@graph': nodes });
const text = value => typeof value === 'string' ? metadataText(value) : '';
const optional = (key, value) => value ? { [key]: value } : {};

export function serializeJsonLd(data) {
  return (JSON.stringify(data) ?? 'null').replace(/[<>&\u2028\u2029]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
}

export function schemaUrl(path) {
  try {
    const url = new URL(path, base);
    if (url.origin !== base || !['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    const canonical = canonicalUrl(url.pathname);
    // Preserve only the existing finite location canonical policy, never arbitrary filters.
    const city = url.searchParams.get('city');
    const purpose = url.searchParams.get('purpose');
    if (url.pathname === '/search' && city && city.length <= 100 && [...url.searchParams.keys()].every(key => ['city','purpose'].includes(key)) && [...new Set(url.searchParams.keys())].every(key => url.searchParams.getAll(key).length === 1) && (!purpose || ['rent','sell'].includes(purpose))) {
      const query = new URLSearchParams({city}); if (purpose) query.set('purpose',purpose);
      return canonical + '?' + query;
    }
    return canonical;
  } catch { return null; }
}

function imageUrls(values) {
  return [...new Set((Array.isArray(values) ? values : [values]).filter(value => typeof value === 'string' && /^(https?:\/\/|\/[^/])/.test(value)).flatMap(value => {
    try { const url = new URL(value,base); return ['http:','https:'].includes(url.protocol) && !url.username && !url.password ? [url.href] : []; } catch { return []; }
  }))];
}

function isoDate(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() <= Date.now() ? date.toISOString() : null;
}

export const organizationSchema = () => ({
  '@context': context, '@type': 'Organization', '@id': organizationId,
  name: SITE_SEO.name, url: base, description: SITE_SEO.description,
  logo: new URL(SITE_SEO.image,base).href,
});
export const websiteSchema = () => ({
  '@context': context, '@type': 'WebSite', '@id': websiteId,
  name: SITE_SEO.name, url: base, publisher: {'@id':organizationId},
});

export function breadcrumbSchema(items) {
  if (!Array.isArray(items) || items.length < 2 || items.some(item => !text(item.name) || !schemaUrl(item.path))) return null;
  return {
    '@type': 'BreadcrumbList', '@id': schemaUrl(items.at(-1).path) + '#breadcrumb',
    itemListElement: items.map((item,index) => ({'@type':'ListItem',position:index+1,name:text(item.name),item:schemaUrl(item.path)})),
  };
}

export const propertyBreadcrumbs = property => [
  {name:STRUCTURED_SEO.home,path:'/'}, {name:STRUCTURED_SEO.properties,path:'/properties'},
  {name:text(property.title),path:'/properties/'+String(property._id).toLowerCase()},
];
export const articleBreadcrumbs = blog => [
  {name:STRUCTURED_SEO.home,path:'/'}, {name:STRUCTURED_SEO.blog,path:'/blog'}, {name:text(blog.title),path:blogPath(blog)},
];

export function propertySchema(property) {
  if (!isPublicListing(property)) return null;
  const url = canonicalUrl('/properties/'+String(property._id).toLowerCase());
  const types = Array.isArray(property.type) ? property.type : [property.type];
  const type = types.includes('apartment') || types.includes('flat') ? 'Apartment'
    : types.includes('house') || types.includes('villa') ? 'House'
    : types.includes('room') || types.includes('independent-rooms') ? 'Accommodation'
    : types.includes('residential') ? 'Residence' : 'Place';
  const location = property.location && typeof property.location === 'object' ? property.location : {};
  const address = Object.fromEntries([['streetAddress',location.address],['addressLocality',location.city],['addressRegion',location.state],['postalCode',location.zipcode],['addressCountry',location.country]].map(([key,value])=>[key,text(value)]).filter(([,value])=>value));
  const images = imageUrls(property.images);
  const accommodation = ['House','Apartment','Accommodation'].includes(type);
  const entity = {
    '@type':type,'@id':url+'#property',url,name:text(property.title),
    ...optional('description',text(property.description)),...optional('image',images.length?images:null),
    ...(Object.keys(address).length?{address:{'@type':'PostalAddress',...address}}:{}),
    ...(accommodation && Number.isSafeInteger(property.bedrooms) && property.bedrooms > 0 ? {numberOfBedrooms:property.bedrooms}:{}),
    ...(accommodation && typeof property.areaSqFt === 'number' && Number.isFinite(property.areaSqFt) && property.areaSqFt > 0 ? {floorSize:{'@type':'QuantitativeValue',value:property.areaSqFt,unitCode:'FTK'}}:{}),
  };
  return graph([
    {'@type':'RealEstateListing','@id':url+'#listing',url,name:text(property.title),...optional('description',text(property.description)),isPartOf:{'@id':websiteId},mainEntity:{'@id':url+'#property'},breadcrumb:{'@id':url+'#breadcrumb'}},
    entity,breadcrumbSchema(propertyBreadcrumbs(property)),
  ]);
}

export function articleSchema(record) {
  const blog = publicBlog(record);
  if (!blog) return null;
  const url = canonicalUrl(blogPath(blog));
  const images = imageUrls(blog.coverImage);
  const author = text(blog.author?.name);
  const published = isoDate(blog.publishDate);
  return graph([
    {'@type':'WebPage','@id':url,url,name:text(blog.title),isPartOf:{'@id':websiteId},mainEntity:{'@id':url+'#article'},breadcrumb:{'@id':url+'#breadcrumb'}},
    {'@type':'BlogPosting','@id':url+'#article',url,headline:text(blog.title),mainEntityOfPage:{'@id':url},publisher:{'@id':organizationId},
      ...optional('description',text(blog.excerpt||blog.content).slice(0,STRUCTURED_SEO.descriptionLength)),
      ...optional('image',images.length?images:null),...(author?{author:{'@type':'Person',name:author}}:{}),...optional('datePublished',published),
    },
    breadcrumbSchema(articleBreadcrumbs(blog)),
  ]);
}

export function collectionSchema({ canonical, name, properties }) {
  if (!Array.isArray(properties) || !properties.length || properties.some(property=>!isPublicListing(property))) return null;
  const url = schemaUrl(canonical);
  if (!url) return null;
  return {'@context':context,'@type':'CollectionPage','@id':url+'#collection',url,name:text(name),isPartOf:{'@id':websiteId},mainEntity:{
    '@type':'ItemList',numberOfItems:properties.length,
    itemListElement:properties.map((property,index)=>({'@type':'ListItem',position:index+1,name:text(property.title),url:canonicalUrl('/properties/'+String(property._id).toLowerCase())})),
  }};
}

export function propertyContextLinks(property) {
  if (!isPublicListing(property)) return [];
  const purposes = Array.isArray(property.purpose) ? property.purpose : [property.purpose];
  const rent = purposes.length === 1 && purposes[0] === 'rent';
  const sale = purposes.length === 1 && purposes[0] === 'sell';
  const links = [{name:rent?STRUCTURED_SEO.rentalLink:sale?STRUCTURED_SEO.saleLink:STRUCTURED_SEO.allLink,path:rent?'/rent':sale?'/buy':'/properties'}];
  const city = text(property.location?.city);
  if (city && city.length <= 100) links.push({name:STRUCTURED_SEO.cityLink.replace('{city}',city),path:'/search?'+new URLSearchParams({city})});
  return links;
}
