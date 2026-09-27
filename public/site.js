(function siteScript() {
 const reduced=matchMedia("(prefers-reduced-motion: reduce)");
 const menuButton=document.querySelector(".menu-toggle");
 const mobileMenu=document.querySelector("#mobile-menu");
 const setMenu=open=>{if(!menuButton||!mobileMenu)return;menuButton.setAttribute("aria-expanded",String(open));menuButton.setAttribute("aria-label",open?"메뉴 닫기":"메뉴 열기");mobileMenu.hidden=!open;};
 menuButton?.addEventListener("click",()=>setMenu(menuButton.getAttribute("aria-expanded")!=="true"));
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!mobileMenu?.hidden){setMenu(false);menuButton?.focus();}});
 document.addEventListener("click",e=>{if(!e.target.closest(".site-header"))setMenu(false);});
 mobileMenu?.addEventListener("click",e=>{if(e.target.closest("a"))setMenu(false);});
 matchMedia("(min-width: 861px)").addEventListener("change",e=>{if(e.matches)setMenu(false);});
 if("IntersectionObserver" in window&&!reduced.matches){
  document.documentElement.classList.add("reveal-ready");
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}}},{threshold:.15});
  document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
  reduced.addEventListener("change",e=>{if(e.matches){observer.disconnect();document.documentElement.classList.remove("reveal-ready");}});
 }
 const video=document.querySelector("#space-video");
 if(video){
  const toggle=document.querySelector(".video-toggle");
  const segments=[...document.querySelectorAll("[data-segment]")];
  const status=document.querySelector(".video-status");
  let userPaused=reduced.matches;
  if(userPaused){video.autoplay=false;video.pause();}
  const updateToggle=()=>{toggle.classList.toggle("is-paused",video.paused);toggle.setAttribute("aria-label",video.paused?"영상 재생":"영상 일시 정지");};
  const play=async()=>{if(userPaused||document.hidden||video.error)return;try{await video.play();status.hidden=true;}catch{updateToggle();}};
  const progress=()=>{
   if(!Number.isFinite(video.duration)||video.duration<=0)return;
   const active=Math.min(3,Math.floor((video.currentTime + 0.001)/video.duration*4));
   segments.forEach((el,i)=>{el.classList.toggle("active",i===active);el.setAttribute("aria-pressed",String(i===active));});
  };
  toggle.addEventListener("click",async()=>{
   if(!video.paused){userPaused=true;video.pause();}
   else{userPaused=false;if(video.error)video.load();await play();}
   updateToggle();
  });
  segments.forEach(el=>el.addEventListener("click",()=>{
   if(!Number.isFinite(video.duration)||video.duration<=0)return;
   video.currentTime=video.duration*Number(el.dataset.segment)/4;userPaused=false;play();progress();
  }));
  video.addEventListener("timeupdate",progress);
  video.addEventListener("play",updateToggle);
  video.addEventListener("pause",()=>{updateToggle();if(!userPaused)play();});
  video.addEventListener("ended",play);
  video.addEventListener("stalled",play);
  video.addEventListener("loadedmetadata",()=>{progress();play();});
  video.addEventListener("error",()=>{status.hidden=false;updateToggle();});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)play();});
  document.addEventListener("pointerdown",()=>{if(!userPaused)play();},{once:true});
  reduced.addEventListener("change",e=>{if(e.matches){userPaused=true;video.pause();}});
  setInterval(()=>{if(video.paused&&!userPaused&&!document.hidden&&video.readyState>=2)play();},1000);
  updateToggle();
 }
 const filters=[...document.querySelectorAll("[data-filter]")];
 const cards=[...document.querySelectorAll("[data-category]")];
 const count=document.querySelector("[data-result-count]");
 if(filters.length){
  const applyFilter=key=>{
   filters.forEach(button=>{const active=button.dataset.filter===key;button.setAttribute("aria-pressed",String(active));button.classList.toggle("active",active);});
   let shown=0;cards.forEach(card=>{const visible=key==="all"||card.dataset.category===key;card.hidden=!visible;if(visible){shown++;card.classList.add("is-visible");}});
   if(count)count.textContent=`${String(shown).padStart(2,"0")}개의 디자인`;
  };
  filters.forEach(button=>button.addEventListener("click",()=>applyFilter(button.dataset.filter)));
 }
})();
