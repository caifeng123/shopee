document.addEventListener("DOMContentLoaded",()=>{document.getElementById("app").insertAdjacentHTML("beforebegin",`
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: center;">
    <button id=clear>清空</button>
    <div style="text-align: center;">
      <div>知虾记录<span id=zhixiaCount>0</span>条</div>
      <div>shopee记录<span id=shopeeCount>0</span>条</div>
    </div>
    <button id=download>下载</button>
  </div>
`);const o=document.getElementById("clear"),n=document.getElementById("zhixiaCount"),a=document.getElementById("shopeeCount"),d=document.getElementById("download");chrome.runtime.onMessage.addListener((t,e,i)=>{t.type==="STORAGE_UPDATE"&&(payload.key==="zhixiaDataLength"&&(n.textContent=t.payload.value),payload.key==="shopeeDataLength"&&(a.textContent=t.payload.value))}),chrome.tabs.query({active:!0,currentWindow:!0},t=>{chrome.tabs.sendMessage(t[0].id,{type:"FROM_POPUP",payload:{action:"get_count"}},e=>{n.textContent=e.payload.zhixiaDataLength,a.textContent=e.payload.shopeeDataLength})}),o.addEventListener("click",()=>{chrome.tabs.query({active:!0,currentWindow:!0},t=>{chrome.tabs.sendMessage(t[0].id,{type:"FROM_POPUP",payload:{action:"clear"}},e=>{n.textContent=e.payload.zhixiaDataLength,a.textContent=e.payload.shopeeDataLength})})}),d.addEventListener("click",()=>{chrome.tabs.query({active:!0,currentWindow:!0},t=>{chrome.tabs.sendMessage(t[0].id,{type:"FROM_POPUP",payload:{action:"download_csv"}},e=>{n.textContent=e.payload.zhixiaDataLength,a.textContent=e.payload.shopeeDataLength})})})});
