async function serve() {
 const fs=await import("node:fs/promises");
 const path=await import("node:path");
 const http=await import("node:http");
 const root=path.resolve("dist");
 const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".avif":"image/avif",".woff2":"font/woff2",".ttf":"font/ttf",".json":"application/json"};
 const server=http.createServer(async(req,res)=>{
  let file;try {
   const url=new URL(req.url,"http://localhost");let pathname=decodeURIComponent(url.pathname);file=path.resolve(root,"."+pathname);
   if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
   const stat=await fs.stat(file);if(stat.isDirectory())file=path.join(file,"index.html");
   const body=await fs.readFile(file);
   res.writeHead(200,{"Content-Type":types[path.extname(file)]||"application/octet-stream","Cache-Control":"no-cache"});res.end(body);
  }catch{try{const body=await fs.readFile(path.join(root,"404.html"));res.writeHead(404,{"Content-Type":"text/html; charset=utf-8"});res.end(body);}catch{res.writeHead(404);res.end("Not found");}}
 });
 server.on("error", error => { console.error(error.code === "EADDRINUSE" ? "미리보기 주소가 이미 사용 중입니다. 실행 중인 LT 미리보기를 새로고침하거나 해당 실행 창을 종료한 뒤 다시 시도해주세요." : error.message); process.exitCode = 1; });
 server.listen(4173,"127.0.0.1",()=>console.log("LT INTERIOR preview: http://127.0.0.1:4173"));
}
await serve();
