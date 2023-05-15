!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("fps-detector",[],e):"object"==typeof exports?exports["fps-detector"]=e():t["fps-detector"]=e()}(self,(()=>(()=>{"use strict";var t={d:(e,l)=>{for(var o in l)t.o(l,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:l[o]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};t.r(e),t.d(e,{FPSDetector:()=>l,default:()=>o});class l{constructor(t,e){"string"==typeof t&&(t=document.querySelector(t)),this.option={width:85,height:30,fpsLevels:[10,30],memLevels:[200,100],colors:["red","orange","green"],bgColor:"#fff",fgColor:"#ddd",padding:1,...e};const l=document.createElement("canvas");l.style.display="block",l.setAttribute("width",this.option.width),l.setAttribute("height",this.option.height),t.appendChild(l),t.title="FPS Detector",t.onclick=t=>{this.showMemory=!this.showMemory,this.render()},this.numbers={"-":{d:"m2.615 8.485-.558-.431 1.116-.862h4.378l1.116.862-1.116.862H3.173l-.558-.431z"},0:{d:"M9.435.638 7.711 2.29v.391l-.001.001v3.551l1.724 1.568V4.396l.001-.255V.639zM1.289 7.8l1.724-1.652v-.391h.001V2.206L1.29.638v3.404l-.001.255v3.502zm.492-7.849 1.652 1.724h.391l.001.001h3.551L8.944-.048H5.539l-.255-.001H1.782zm7.684 15.56-1.724-1.652v-.391H7.74V9.917l1.724-1.568v3.405l.001.255v3.502zM1.319 8.349l1.724 1.652v.391h.001v3.551L1.32 15.511v-3.404l-.001-.255V8.35zm.492 7.849 1.652-1.724h3.942l1.568 1.724H5.568l-.255.002H1.811z"},1:{d:"M9.435.638 7.711 2.29v.391l-.001.001v3.551l1.724 1.568V4.396l.001-.255V.639zm.03 14.873-1.724-1.652v-.391H7.74V9.917l1.724-1.568v3.405l.001.255v3.502z"},2:{d:"M9.435.638 7.711 2.29v.391l-.001.001v3.551l1.724 1.568V4.396l.001-.255V.639zM1.781-.049l1.652 1.724h.391l.001.001h3.551L8.944-.048H5.539l-.255-.001H1.782zm.834 8.534-.558-.431 1.116-.862h4.378l1.116.862-1.116.862H3.173l-.558-.431zm-1.296-.136 1.724 1.652v.391h.001v3.551L1.32 15.511v-3.404l-.001-.255V8.35zm.492 7.849 1.652-1.724h3.942l1.568 1.724H5.568l-.255.002H1.811z"},3:{d:"M9.435.638 7.711 2.29v.391l-.001.001v3.551l1.724 1.568V4.396l.001-.255V.639zM1.781-.049l1.652 1.724h.391l.001.001h3.551L8.944-.048H5.539l-.255-.001H1.782zm.834 8.534-.558-.431 1.116-.862h4.378l1.116.862-1.116.862H3.173l-.558-.431zm6.85 7.026-1.724-1.652v-.391H7.74V9.917l1.724-1.568v3.405l.001.255v3.502zm-7.654.687 1.652-1.724h3.942l1.568 1.724H5.568l-.255.002H1.811z"},4:{d:"M9.435.638 7.711 2.29v.391l-.001.001v3.551l1.724 1.568V4.396l.001-.255V.639zM1.289 7.8l1.724-1.652v-.391h.001V2.206L1.29.638v3.404l-.001.255v3.502zm1.326.685-.558-.431 1.116-.862h4.378l1.116.862-1.116.862H3.173l-.558-.431zm6.85 7.026-1.724-1.652v-.391H7.74V9.917l1.724-1.568v3.405l.001.255v3.502z"},5:{d:"m1.289 7.8 1.724-1.652v-.391h.001V2.206L1.29.638v3.404l-.001.255v3.502zm.492-7.849 1.652 1.724h.391l.001.001h3.551L8.944-.048H5.539l-.255-.001H1.782zm.834 8.534-.558-.431 1.116-.862h4.378l1.116.862-1.116.862H3.173l-.558-.431zm6.85 7.026-1.724-1.652v-.391H7.74V9.917l1.724-1.568v3.405l.001.255v3.502zm-7.654.687 1.652-1.724h3.942l1.568 1.724H5.568l-.255.002H1.811z"},6:{d:"m1.289 7.8 1.724-1.652v-.391h.001V2.206L1.29.638v3.404l-.001.255v3.502zm.492-7.849 1.652 1.724h.391l.001.001h3.551L8.944-.048H5.539l-.255-.001H1.782zm.834 8.534-.558-.431 1.116-.862h4.378l1.116.862-1.116.862H3.173l-.558-.431zm6.85 7.026-1.724-1.652v-.391H7.74V9.917l1.724-1.568v3.405l.001.255v3.502zM1.319 8.349l1.724 1.652v.391h.001v3.551L1.32 15.511v-3.404l-.001-.255V8.35zm.492 7.849 1.652-1.724h3.942l1.568 1.724H5.568l-.255.002H1.811z"},7:{d:"M9.435.638 7.711 2.29v.391l-.001.001v3.551l1.724 1.568V4.396l.001-.255V.639zM1.781-.049l1.652 1.724h.391l.001.001h3.551L8.944-.048H5.539l-.255-.001H1.782zm7.684 15.56-1.724-1.652v-.391H7.74V9.917l1.724-1.568v3.405l.001.255v3.502z"},8:{d:"M9.435.638 7.711 2.29v.391l-.001.001v3.551l1.724 1.568V4.396l.001-.255V.639zM1.289 7.8l1.724-1.652v-.391h.001V2.206L1.29.638v3.404l-.001.255v3.502zm.492-7.849 1.652 1.724h.391l.001.001h3.551L8.944-.048H5.539l-.255-.001H1.782zm.834 8.534-.558-.431 1.116-.862h4.378l1.116.862-1.116.862H3.173l-.558-.431zm6.85 7.026-1.724-1.652v-.391H7.74V9.917l1.724-1.568v3.405l.001.255v3.502zM1.319 8.349l1.724 1.652v.391h.001v3.551L1.32 15.511v-3.404l-.001-.255V8.35zm.492 7.849 1.652-1.724h3.942l1.568 1.724H5.568l-.255.002H1.811z"},9:{d:"M9.435.638 7.711 2.29v.391l-.001.001v3.551l1.724 1.568V4.396l.001-.255V.639zM1.289 7.8l1.724-1.652v-.391h.001V2.206L1.29.638v3.404l-.001.255v3.502zm.492-7.849 1.652 1.724h.391l.001.001h3.551L8.944-.048H5.539l-.255-.001H1.782zm.834 8.534-.558-.431 1.116-.862h4.378l1.116.862-1.116.862H3.173l-.558-.431zm6.85 7.026-1.724-1.652v-.391H7.74V9.917l1.724-1.568v3.405l.001.255v3.502z"}},this.initNumbers(l),this.ctx=l.getContext("2d"),this.start()}render(){const t=this.option.width,e=this.option.height,l=this.ctx,o=this.list,i=this.option.padding,s=i,h=i,r=t-(22+3*i),n=e-2*i;let v=i;if(o.length>r?o.length=r:v=i+(r-o.length),l.fillStyle=this.option.bgColor,l.fillRect(0,0,t,e),this.showMemory){const o=window.performance.memory.usedJSHeapSize/1048576;return l.font="Bold 16px",l.textAlign="center",l.textBaseline="middle",l.fillStyle=this.getMEMColor(o),void l.fillText(`MEM ${o.toFixed(1)} MB`,t/2,Math.ceil(e/2)+1)}l.fillStyle=this.option.fgColor,l.fillRect(s,h,r,n);let m,d;[].concat(o).reverse().forEach(((t,e)=>{m=t;const o=this.getFPSColor(t);d=o,l.fillStyle=o;const i=Math.max(Math.floor(t/60*n),1);l.fillRect(v+e,n+h-i,1,i)}));const c=`${m}`.padStart(2,"0"),a=Math.floor(s+r+i),f=Math.ceil((e-16)/2);c.split("").forEach(((t,e)=>{const o=this.getImg(t,d);o&&l.drawImage(o,a+11*e,f)}))}getFPSColor(t){const e=this.option.colors,l=this.option.fpsLevels;let o;for(o=0;o<l.length;o++){if(t<l[o])return e[o]}return e[o]}getMEMColor(t){const e=this.option.colors,l=this.option.memLevels;let o;for(o=0;o<l.length;o++){if(t>l[o])return e[o]}return e[o]}initNumbers(t){const e=this.numbers,l=this.option.colors;Object.keys(e).forEach((o=>{const i=e[o];l.forEach((e=>{if(i[e])return;const l=`\n                <svg viewBox="0 0 11 16" width="11" height="16" xmlns="http://www.w3.org/2000/svg">\n                    <path fill="${e}" d="${i.d}" />\n                </svg>\n                `,o=document.createElement("img");o.src=`data:image/svg+xml;base64,${btoa(l)}`,t.appendChild(o),i[e]=o}))}))}getImg(t,e){const l=this.numbers[t];if(l)return l[e]}start(){this.stopped=!1,this.list=[],this.frames=0,this.startTime=window.performance.now(),this.update()}update(){this.stopped||window.requestAnimationFrame((()=>{this.count()}))}count(){const t=this.list,e=window.performance.now();let l=e-this.startTime;if(l<1e3)this.frames+=1;else{for(l-=1e3;l>1e3;)t.unshift(0),l-=1e3;t.unshift(this.frames),this.render(),this.frames=1,this.startTime=e-l}this.update()}stop(){this.stopped=!0}}const o=l;return e})()));
//# sourceMappingURL=fps-detector.js.map