async function check(){
 const fs=await import("node:fs/promises");const path=await import("node:path");const assert=(await import("node:assert/strict")).default;
 const concepts=JSON.parse(await fs.readFile("content/concepts.json","utf8"));const manifest=JSON.parse(await fs.readFile("content/image-generation-manifest.json","utf8"));
 assert.equal(concepts.length,9);assert.deepEqual(["warm","modern","hotel"].map(cat=>concepts.filter(c=>c.category===cat).length),[4,3,2]);
 assert.equal(manifest.assets.length,29);assert.equal(new Set(manifest.assets.map(a=>a.key)).size,29);assert.equal(new Set(manifest.assets.map(a=>a.sha256)).size,29);
 for(const asset of manifest.assets){assert.ok(asset.width>0&&asset.height>0);await fs.access("dist"+asset.file);if(asset.thumbnail)await fs.access("dist"+asset.thumbnail);}
 const routes=["","gallery","about","contact",...concepts.map(c=>"gallery/"+c.slug)];
 for(const route of routes){
  const filename=path.join("dist",route,"index.html");const html=await fs.readFile(filename,"utf8");
  assert.equal((html.match(/<h1\b/g)||[]).length,1,filename+" requires one h1");
  assert.equal((html.match(/<main\b/g)||[]).length,1,filename+" requires one main");
  assert.ok(html.includes('lang="ko"'));
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   const value=match[1];if(/^(?:https?:|tel:|data:)/.test(value))continue;
   if(value.startsWith("#")){assert.ok(html.includes(`id="${value.slice(1)}"`),"Missing anchor "+value+" on "+route);continue;}
   if(!value.startsWith("/"))continue;
   let target=path.join("dist",value);if(value.endsWith("/"))target=path.join(target,"index.html");await fs.access(target);
  }
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,"Duplicate ids: "+route);
  if(route.startsWith("gallery/"))for(const room of ["living","kitchen","bedroom"])assert.ok(html.includes(route.split("/")[1]+"-"+room+".webp"));
 }
 const contact=await fs.readFile("dist/contact/index.html","utf8");
 const config=JSON.parse(await fs.readFile("content/site.json","utf8"));
 if(!config.phone)assert.ok(!contact.includes('href="tel:'));
 if(!config.kakaoUrl)assert.ok(contact.includes("연결 준비 중"));
 await fs.access("dist/404.html");
 console.log("PASS: 13 routes, 9 concepts (4/3/2), 28 photos + logo, unique assets, local links/anchors, heading structure, and contact pending states.");
}
await check();
