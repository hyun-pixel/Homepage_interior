async function serve() {
 const fs=await import("node:fs/promises");
 const path=await import("node:path");
 const http=await import("node:http");
 const root=path.resolve("dist");
 const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".avif":"image/avif",".woff2":"font/woff2",".ttf":"font/ttf",".json":"application/json",".mp4":"video/mp4"};
 const server=http.createServer(async(req,res)=>{
  let file;try {
   const url=new URL(req.url,"http://localhost");let pathname=decodeURIComponent(url.pathname);file=path.resolve(root,"."+pathname);
   if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
   const stat=await fs.stat(file);if(stat.isDirectory())file=path.join(file,"index.html");
   const body=await fs.readFile(file);
   const isVideo=path.extname(file)===".mp4";
   const headers={"Content-Type":types[path.extname(file)]||"application/octet-stream","Cache-Control":"no-cache","Content-Length":body.length};
   if(isVideo)headers["Accept-Ranges"]="bytes";
   if(isVideo&&req.headers.range){
    const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    const start=range?(range[1]?Number(range[1]):Math.max(0,body.length-Number(range[2]))):NaN;
    const end=range?(range[1]&&range[2]?Math.min(Number(range[2]),body.length-1):body.length-1):NaN;
    if(!range||(!range[1]&&!range[2])||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=body.length){
     res.writeHead(416,{"Content-Range":"bytes */"+body.length});res.end();return;
    }
    res.writeHead(206,{...headers,"Content-Range":"bytes "+start+"-"+end+"/"+body.length,"Content-Length":end-start+1});
    res.end(req.method==="HEAD"?undefined:body.subarray(start,end+1));return;
   }
   res.writeHead(200,headers);res.end(req.method==="HEAD"?undefined:body);
  }catch{try{const body=await fs.readFile(path.join(root,"404.html"));res.writeHead(404,{"Content-Type":"text/html; charset=utf-8"});res.end(body);}catch{res.writeHead(404);res.end("Not found");}}
 });
 server.on("error", error => { console.error(error.code === "EADDRINUSE" ? "미리보기 주소가 이미 사용 중입니다. 실행 중인 LT 미리보기를 새로고침하거나 해당 실행 창을 종료한 뒤 다시 시도해주세요." : error.message); process.exitCode = 1; });
 server.listen(4173,"127.0.0.1",()=>console.log("LT INTERIOR preview: http://127.0.0.1:4173"));
}
await serve();
