async function fetchDesignAssets() {
 const fs=await import("node:fs/promises");
 const path=await import("node:path");
 const root=process.cwd();
 const save=async (file,body)=>{await fs.mkdir(path.dirname(path.join(root,file)),{recursive:true});await fs.writeFile(path.join(root,file),body);};
 const fetchOk=async(url)=>{const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"}});if(!r.ok)throw new Error(`${r.status} ${url}`);return r;};
 const names=["house","arrow-up-right","arrow-left","arrow-right","menu","x","play","pause","phone","message-circle"];
 await Promise.all(names.map(async name=>save(`public/icons/${name}.svg`,await(await fetchOk(`https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/${name}.svg`)).text())));
 await save("licenses/lucide-LICENSE",await(await fetchOk("https://raw.githubusercontent.com/lucide-icons/lucide/main/LICENSE")).text());
 let css=await(await fetchOk("https://fonts.googleapis.com/css2?family=Archivo:wght@400;500&family=Manrope:wght@400;500&family=Playfair+Display:wght@400;500&display=swap")).text();
 const latin=[...css.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/g)].map(x=>x[1]);
 if(latin.length)css=latin.join("\n");
 const urls=[...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(x=>x[1]))];
 for(let i=0;i<urls.length;i++){const url=urls[i];const filename=`latin-${i}.${new URL(url).pathname.split(".").pop()}`;await save(`public/fonts/${filename}`,Buffer.from(await(await fetchOk(url)).arrayBuffer()));css=css.split(url).join(`/fonts/${filename}`);}
 const purl="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2";
 await save("public/fonts/PretendardVariable.woff2",Buffer.from(await(await fetchOk(purl)).arrayBuffer()));
 css+='\n@font-face{font-family:"Pretendard";font-weight:100 900;font-display:swap;src:url("/fonts/PretendardVariable.woff2") format("woff2");}\n';
 await save("public/fonts.css",css);
 await Promise.all(["archivo","manrope","playfairdisplay"].map(async name=>save(`licenses/${name}-OFL.txt`,await(await fetchOk(`https://raw.githubusercontent.com/google/fonts/main/ofl/${name}/OFL.txt`)).text())));
 await save("licenses/pretendard-LICENSE",await(await fetchOk("https://raw.githubusercontent.com/orioncactus/pretendard/main/LICENSE")).text());
 console.log(`Saved ${names.length} Lucide icons, ${urls.length+1} font files and licenses.`);
}
await fetchDesignAssets();
