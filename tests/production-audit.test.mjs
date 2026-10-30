import test from 'node:test';
import assert from 'node:assert/strict';
import { publicCategory, validCategorySlug, categoryMetadata } from '../src/seo/category-seo.js';
import { staticEntries } from '../src/seo/sitemap.utils.js';
const category={name:'Commercial & Shops',slug:'commercial',isActive:true,description:'<b>Public</b> listings &amp; details',secret:'PRIVATE_CATEGORY_MARKER',sub:[{name:'Offices',slug:'office',secret:'PRIVATE'}, {name:'Hidden',slug:'hidden',isActive:false}]};
test('only real active categories and safe public fields are serialized',()=>{
 assert.equal(publicCategory({...category,isActive:false}),null);
 assert.equal(publicCategory({...category,slug:'bad/slug'}),null);
 assert.equal(publicCategory({...category,name:''}),null);
 const result=publicCategory(category);assert.equal(result.sub.length,1);assert.ok(!JSON.stringify(result).includes('PRIVATE'));
 for(const input of ['', '../admin','a?x=b','a'.repeat(121),'(a+)+'])assert.equal(validCategorySlug(input),false);
});
test('category metadata is unique, sanitized and conservative on filters and failures',()=>{
 const result=categoryMetadata(publicCategory(category));assert.equal(result.title.absolute,'Commercial & Shops Properties | RentzyPro');assert.equal(result.description,'Public listings & details');assert.equal(result.alternates.canonical,'https://rentzypro.com/category/commercial');assert.equal(result.robots.index,true);
 assert.equal(categoryMetadata(category,true).robots.index,false);assert.equal(categoryMetadata(null).robots.index,false);assert.equal(categoryMetadata(null,false,true).robots.index,false);
 assert.ok(!staticEntries().some(item=>item.url.endsWith('/featured-properties')));
});

import { blogFeed } from '../src/seo/feed.js';
import { seoBlog } from './fixtures/seo-api.mjs';
test('RSS uses production canonical links, actual publication dates and only published records',()=>{
 const xml=blogFeed([{...seoBlog,title:'Home & <b>Rent</b>'},{...seoBlog,status:'draft',title:'PRIVATE_DRAFT'}]);
 assert.ok(xml.includes('<title>Home &amp; Rent</title>'));assert.ok(xml.includes('https://rentzypro.com/blog/published-guide'));assert.ok(xml.includes('<pubDate>Thu, 01 Jan 2026 00:00:00 GMT</pubDate>'));assert.ok(!xml.includes('PRIVATE_DRAFT'));
 for(const publishDate of [undefined,'invalid','2099-01-01'])assert.ok(!blogFeed([{...seoBlog,publishDate}]).includes('<pubDate>'));
 assert.ok(!xml.includes('lastBuildDate'));
});
