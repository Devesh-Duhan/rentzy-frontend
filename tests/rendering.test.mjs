import test from 'node:test';
import assert from 'node:assert/strict';
import {publicBlog,blogMetadata,blogPath,validBlogKey} from '../src/seo/blog-seo.js';
import {HOME_CATEGORIES,homeQuery,homeQueryKey} from '../src/lib/home-properties.js';
const article={_id:'aaaaaaaaaaaaaaaaaaaaaaaa',title:'Rental &amp; <b>guide</b>',content:'A real public article about renting in Hisar.',slug:'rental-guide',status:'published',author:{name:'Editor',email:'PRIVATE'},adminNotes:'PRIVATE'};
test('published article metadata uses actual text and its canonical route',()=>{
 const blog=publicBlog(article),meta=blogMetadata(blog,'rental-guide');assert.equal(meta.title.absolute,'Rental & guide | RentzyPro');assert.equal(meta.description,article.content);assert.equal(meta.alternates.canonical,'https://rentzypro.com/blog/rental-guide');assert.equal(meta.robots.index,true);assert.equal(meta.openGraph.type,'article');
 assert.equal(blog.author.email,undefined);assert.equal(blog.adminNotes,undefined);assert.equal(publicBlog({...article,status:'draft'}),null);assert.equal(publicBlog({...article,title:{bad:true}}),null);assert.equal(publicBlog({...article,_id:'invalid'}),null);
});
test('missing fields and temporary failures have honest fallbacks',()=>{
 assert.equal(blogPath({...article,slug:undefined}),'/blog/aaaaaaaaaaaaaaaaaaaaaaaa');assert.equal(validBlogKey('../admin'),false);assert.equal(validBlogKey('guide'),true);
 assert.equal(blogMetadata(null,'unavailable').robots.index,false);assert.equal(blogMetadata(article,'rental-guide').openGraph.images[0].url,'https://rentzypro.com/images/android-chrome-512x512.png');
 assert.equal(publicBlog({...article,content:undefined},true).content,undefined);assert.equal(publicBlog({...article,content:undefined}),null);
});
test('homepage queries remain bounded, separated by category and featured purpose',()=>{
 assert.equal(HOME_CATEGORIES.length,7);for(const category of HOME_CATEGORIES){const query=new URLSearchParams(homeQuery(category));assert.equal(query.get('limit'),'10');assert.equal(query.get('page'),'1');}
 const featured=HOME_CATEGORIES[0];assert.notDeepEqual(homeQueryKey(featured,'sell'),homeQueryKey(featured,'rent'));assert.equal(new URLSearchParams(homeQuery(featured,'rent')).get('purpose'),'rent');
});
