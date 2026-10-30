import test from 'node:test';
import assert from 'node:assert/strict';
import {organizationSchema,websiteSchema,propertySchema,articleSchema,collectionSchema,breadcrumbSchema,serializeJsonLd,schemaUrl,propertyContextLinks} from '../src/seo/schema.js';
import {seoBlog} from './fixtures/seo-api.mjs';
import {properties} from './fixtures/data.mjs';
const home={...properties[0],_id:'999999999999999999999999',type:['residential','house'],title:'House &amp; <b>home</b>',location:{city:'Hisar',state:'Haryana'},images:['/images/home-interior.jpg','javascript:alert(1)']};
const node=(value,type)=>value['@graph'].find(item=>item['@type']===type);

test('identity uses canonical existing brand data without invented business attributes',()=>{
 const org=organizationSchema(),site=websiteSchema();assert.equal(org.name,'RentzyPro');assert.equal(org.url,'https://rentzypro.com');assert.equal(site.publisher['@id'],org['@id']);assert.equal(site['@id'],'https://rentzypro.com/#website');
 for(const key of ['address','telephone','email','sameAs','aggregateRating','award','legalName'])assert.equal(org[key],undefined);
 assert.ok(org.logo.endsWith('/images/android-chrome-512x512.png'));
});
test('JSON-LD serialization round-trips arbitrary text and cannot close its script element',()=>{
 const value={text:'</script><script>alert("x")</script> & > \u2028\u2029'};const encoded=serializeJsonLd(value);
 assert.ok(!encoded.includes('<'));assert.ok(!encoded.includes('>'));assert.ok(!encoded.includes('&'));assert.ok(!encoded.includes('\u2028'));assert.deepEqual(JSON.parse(encoded),value);
});
test('entity canonicals reject foreign/unsafe URLs and retain only legitimate city context',()=>{
 assert.equal(schemaUrl('https://evil.example/home'),null);assert.equal(schemaUrl('javascript:alert(1)'),null);assert.equal(schemaUrl('/rent/?sort=price#top'),'https://rentzypro.com/rent');
 assert.equal(schemaUrl('/search?city=Hisar&purpose=rent'),'https://rentzypro.com/search?city=Hisar&purpose=rent');assert.equal(schemaUrl('/search?city=Hisar&sort=price'),'https://rentzypro.com/search');
});
test('public homes use a listing and accommodation entity with real facts, not a product/offer',()=>{
 const data=propertySchema(home),listing=node(data,'RealEstateListing'),house=node(data,'House');assert.ok(listing);assert.ok(house);assert.equal(house.name,'House & home');assert.equal(house.numberOfBedrooms,2);assert.equal(house.floorSize.unitCode,'FTK');assert.equal(house.floorSize.value,1250);assert.deepEqual(house.image,['https://rentzypro.com/images/home-interior.jpg']);
 assert.equal(listing.mainEntity['@id'],house['@id']);assert.equal(house.address.addressLocality,'Hisar');assert.equal(house.address.addressCountry,undefined);
 const text=JSON.stringify(data);for(const value of ['"Product"','"Offer"','aggregateRating','priceCurrency','VacationRental','contactNumber','sellerId'])assert.ok(!text.includes(value),value);
});
test('type mapping never gives commercial/land listings invented home facts',()=>{
 for(const type of ['commercial','land','industrial','custom-type']){const data=propertySchema({...home,type:[type]});const place=node(data,'Place');assert.ok(place);assert.equal(place.numberOfBedrooms,undefined);assert.equal(place.floorSize,undefined);}
 assert.ok(node(propertySchema({...home,type:['residential','flat']}),'Apartment'));assert.ok(node(propertySchema({...home,type:['independent-rooms']}),'Accommodation'));
});
test('missing and invalid optional property values are omitted',()=>{
 const house=node(propertySchema({...home,location:{},images:[],areaSqFt:-1,bedrooms:0}),'House');for(const key of ['address','image','floorSize','numberOfBedrooms'])assert.equal(house[key],undefined);
});
test('private, rejected, unavailable and malformed records produce no property graph',()=>{
 for(const patch of [{isVerified:false},{isPaid:false},{rejectionReason:'Rejected'},{status:'rented'},{status:'sold'},{_id:'bad'}])assert.equal(propertySchema({...home,...patch}),null);
});
test('published editorial data uses visible title/author/image and reliable publication date only',()=>{
 const article=node(articleSchema({...seoBlog,updatedAt:'2026-02-01',metaTitle:'Different SEO title',coverImage:'/images/home-interior.jpg'}),'BlogPosting');
 assert.equal(article.headline,seoBlog.title);assert.equal(article.author.name,'Test editor');assert.equal(article.datePublished,'2026-01-01T00:00:00.000Z');assert.equal(article.dateModified,undefined);assert.equal(article.author.email,undefined);assert.ok(article.image[0].endsWith('/images/home-interior.jpg'));assert.equal(article.articleBody,undefined);
});
test('drafts and missing optional author/date/photo do not gain fabricated article attributes',()=>{
 assert.equal(articleSchema({...seoBlog,status:'draft'}),null);const article=node(articleSchema({...seoBlog,author:{},coverImage:'javascript:bad',publishDate:'2999-01-01'}),'BlogPosting');for(const key of ['author','image','datePublished','dateModified'])assert.equal(article[key],undefined);
});
test('breadcrumbs are ordered canonical visible trails with no duplicate entity definitions',()=>{
 const graph=propertySchema(home);const trail=node(graph,'BreadcrumbList');assert.deepEqual(trail.itemListElement.map(item=>item.position),[1,2,3]);assert.equal(trail.itemListElement[2].item,'https://rentzypro.com/properties/'+home._id);assert.equal(new Set(graph['@graph'].map(item=>item['@id'])).size,3);
 assert.equal(breadcrumbSchema([{name:'Home',path:'/'}]),null);assert.equal(breadcrumbSchema([{name:'Home',path:'/'},{name:'Bad',path:'https://evil.example'}]),null);
});
test('collection describes only the displayed public items, not a fabricated inventory count',()=>{
 const result=collectionSchema({canonical:'/search?city=Hisar',name:'Properties in Hisar',properties:[home]});assert.equal(result.mainEntity.numberOfItems,1);assert.equal(result.mainEntity.itemListElement[0].url,'https://rentzypro.com/properties/'+home._id);
 assert.equal(collectionSchema({canonical:'/rent',name:'Rent',properties:[]}),null);assert.equal(collectionSchema({canonical:'/rent',name:'Rent',properties:[{...home,isVerified:false}]}),null);
});
test('contextual property links use actual routes and actual city; missing cities are not invented',()=>{
 assert.deepEqual(propertyContextLinks(home),[{name:'Browse rental properties',path:'/rent'},{name:'Properties in Hisar',path:'/search?city=Hisar'}]);assert.equal(propertyContextLinks({...home,location:{}}).length,1);assert.equal(propertyContextLinks({...home,purpose:['sell']})[0].path,'/buy');assert.deepEqual(propertyContextLinks({...home,isVerified:false}),[]);
});
