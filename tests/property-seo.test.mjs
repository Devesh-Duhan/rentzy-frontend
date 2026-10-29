import test from 'node:test';
import assert from 'node:assert/strict';
import { properties } from './fixtures/data.mjs';
import { propertyMetadata, isPublicListing, validPropertyId, locationMetadata, listingMetadata, filterMetadata, searchQuery, toSearchParams } from '../src/seo/property-seo.js';
const home={...properties[0],title:'Sunny &amp; <b>Home</b>',type:['residential','house'],furnishing:'furnished',description:'Bright public rental house.'};
const snapshot=(rows=[home],count=rows.length)=>({state:'ok',data:{properties:rows,data:rows,count,pages:1,page:1}});

test('real title, type, bedrooms, city, state, price, furnishing, description and photo produce metadata',()=>{
 const result=propertyMetadata(home,home._id);
 assert.equal(result.title.absolute,'2 BHK House for Rent in Hisar | RentzyPro');
 for(const text of ['₹18,500','Furnished','Hisar','Haryana','Sunny & Home','Bright public rental house']) assert.ok(result.description.includes(text),text);
 assert.equal(result.openGraph.images[0].url,'https://rentzypro.com/images/home-interior.jpg');
 assert.equal(result.alternates.canonical,`https://rentzypro.com/properties/${home._id}`);
 assert.equal(result.robots.index,true);
});
test('sale and dual-purpose metadata never pretends all properties are rentals',()=>{
 assert.match(propertyMetadata({...home,purpose:['sell']},home._id).title.absolute,/for Sale/);
 assert.match(propertyMetadata({...home,purpose:['rent','sell']},home._id).title.absolute,/for Rent or Sale/);
 assert.doesNotMatch(propertyMetadata({...home,type:['commercial']},home._id).title.absolute,/BHK/);
});
test('missing photos, city, bedrooms and furnishing never invent missing facts',()=>{
 const result=propertyMetadata({...home,location:{},images:[],bedrooms:undefined,furnishing:undefined,price:undefined},home._id);
 assert.equal(result.title.absolute,'House for Rent | RentzyPro');
 assert.doesNotMatch(result.description,/Hisar|Haryana|₹|Furnished|BHK/);
 assert.equal(result.openGraph.images[0].url,'https://rentzypro.com/images/android-chrome-512x512.png');
});
for(const [name,record] of [['removed',null],['pending',{...home,isVerified:false}],['rejected',{...home,rejectionReason:'Rejected'}],['rented',{...home,status:'rented'}],['sold',{...home,status:'sold'}],['expired',{...home,status:'expired'}],['hidden',{...home,status:'hidden'}],['unpaid',{...home,isPaid:false}],['malformed',{...home,_id:'invalid'}]]) {
 test(`${name} has noindex metadata with no private record values`,()=>{
  const result=propertyMetadata(record,home._id);
  assert.equal(result.robots.index,false);assert.doesNotMatch(JSON.stringify(result),/Sunny|18,500|home-interior/);
 });
}
test('invalid IDs are rejected and API failures are neutral, noindex and distinct from missing',()=>{
 assert.equal(validPropertyId('invalid'),false);assert.equal(validPropertyId(home._id),true);
 assert.equal(propertyMetadata(null,home._id,'error').robots.index,false);
 assert.match(propertyMetadata(null,home._id,'error').title.absolute,/Temporarily/);
});
test('encoded HTML/control characters and unsafe image protocols cannot become markup',()=>{
 const result=propertyMetadata({...home,title:'&lt;script&gt;secret&lt;/script&gt;\nHome',type:['<img src=x>'],images:['javascript:alert(1)']},home._id);
 assert.ok(!result.title.absolute.includes('<'));assert.ok(!result.description.includes('<'));
 assert.equal(result.openGraph.images[0].url,'https://rentzypro.com/images/android-chrome-512x512.png');
});
test('only simple exact city searches with public inventory are indexable',()=>{
 for(const suffix of ['','&purpose=rent','&utm_source=ad']) {
  const result=locationMetadata(new URLSearchParams('city=hisar'+suffix),snapshot());
  assert.equal(result.robots.index,true);assert.match(result.title.absolute,/Hisar/);
  assert.match(result.alternates.canonical,/\/search\?city=Hisar/);
  assert.ok(!result.alternates.canonical.includes('utm_'));
 }
});
test('empty, partial city matches, mixed inventory, invalid purpose and arbitrary filters remain noindex',()=>{
 for(const query of ['','city=His','city=Hisar&sort=newest','city=Hisar&page=2','city=Hisar&type=house','city=Hisar&purpose=invalid','city=Hisar&city=Delhi']) {
  assert.equal(locationMetadata(new URLSearchParams(query),snapshot()).robots.index,false,query);
 }
 assert.equal(locationMetadata(new URLSearchParams('city=Hisar'),snapshot([],0)).robots.index,false);
 assert.equal(locationMetadata(new URLSearchParams('city=Hisar'),snapshot([{...home,isVerified:false}])).robots.index,false);
 assert.equal(locationMetadata(new URLSearchParams('city=Hisar'),{state:'error',data:null}).robots.index,false);
});
test('rental inventory metadata uses real count; filters, empty inventory and failures are noindex',()=>{
 assert.match(listingMetadata('/rent',new URLSearchParams(),snapshot()).description,/1 available property for rent/);
 assert.equal(listingMetadata('/rent',new URLSearchParams('sort=price'),snapshot()).robots.index,false);
 assert.equal(listingMetadata('/rent',new URLSearchParams(),snapshot([],0)).robots.index,false);
 assert.equal(listingMetadata('/rent',new URLSearchParams(),{state:'error',data:null}).robots.index,false);
 for(const route of ['/buy','/properties']) assert.equal(filterMetadata(route,new URLSearchParams('type=room')).robots.index,false);
});
test('server and browser search query normalization use identical existing filters',()=>{
 assert.equal(searchQuery(toSearchParams({city:'Hisar',purpose:'rent',utm_source:'ad'})),'purpose=rent&city=Hisar&sort=relevance&page=1');
 assert.deepEqual(toSearchParams({city:['Hisar','Delhi']}).getAll('city'),['Hisar','Delhi']);
});

test('a record cannot supply metadata for another property identifier',()=>{
 const result=propertyMetadata(home,'999999999999999999999999');
 assert.equal(result.robots.index,false);assert.doesNotMatch(JSON.stringify(result),/Sunny|home-interior/);
});
