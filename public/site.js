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
  let active=0;
  let userPaused=reduced.matches;
  let playBlocked=false;
  const updateToggle=()=>{
   const paused=userPaused||playBlocked||Boolean(video.error);
   toggle.classList.toggle("is-paused",paused);
   toggle.setAttribute("aria-label",paused?"영상 재생":"영상 일시 정지");
  };
  const play=async()=>{
   if(userPaused||document.hidden||video.error)return;
   const source=video.src;
   try{
    await video.play();
    if(source!==video.src)return;
    playBlocked=false;status.hidden=true;updateToggle();
   }catch(error){
    if(source!==video.src||error.name==="AbortError")return;
    playBlocked=true;updateToggle();
   }
  };
  const select=index=>{
   active=(index+segments.length)%segments.length;
   const selected=segments[active];
   segments.forEach((button,i)=>{
    button.classList.toggle("active",i===active);
    button.setAttribute("aria-pressed",String(i===active));
   });
   playBlocked=false;status.hidden=true;
   video.poster=selected.dataset.poster;
   video.setAttribute("aria-label",selected.dataset.name+" 공간 영상");
   video.src=selected.dataset.src;
   video.load();
   updateToggle();play();
  };
  toggle.addEventListener("click",()=>{
   if(userPaused||playBlocked||video.error){
    userPaused=false;playBlocked=false;
    if(video.error){status.hidden=true;video.load();}
    play();
   }else{userPaused=true;video.pause();}
   updateToggle();
  });
  segments.forEach((button,index)=>button.addEventListener("click",()=>select(index)));
  video.addEventListener("canplay",play);
  video.addEventListener("play",updateToggle);
  video.addEventListener("pause",updateToggle);
  video.addEventListener("ended",()=>{if(!userPaused)select(active+1);});
  video.addEventListener("error",()=>{status.hidden=false;updateToggle();});
  document.addEventListener("visibilitychange",()=>{
   if(document.hidden)video.pause();else play();
  });
  reduced.addEventListener("change",event=>{
   if(event.matches){userPaused=true;video.pause();updateToggle();}
  });
  updateToggle();play();
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
