const v=`zhixia_${_()}`,g=`shopee_${_()}`,N={TW:{siteName:"台湾",host:"xiapi.xiapibuy.com",imgBase:"https://down-tw.img.susercontent.com/file"},MALAYSIA:{siteName:"马来西亚",host:"my.xiapibuy.com",imgBase:"https://down-my.img.susercontent.com/file"},SINGAPORE:{siteName:"新加坡",host:"sg.xiapibuy.com",imgBase:"https://down-sg.img.susercontent.com/file"},PH:{siteName:"菲律宾",host:"ph.xiapibuy.com",imgBase:"https://down-ph.img.susercontent.com/file"},VN:{siteName:"越南",host:"vn.xiapibuy.com",imgBase:"https://down-vn.img.susercontent.com/file"},TH:{siteName:"泰国",host:"th.xiapibuy.com",imgBase:"https://down-th.img.susercontent.com/file"}};function E(o){return Object.values(N).find(t=>o===t.host)||{}}function S({itemId:o,shopId:t,itemName:r}){if(!(!o||!t||!r))return`https://${location.host}/${r}-i.${t}.${o}`}chrome.runtime.onMessage.addListener((o,t,r)=>{if(o.type==="FROM_POPUP"){let n=0,a=0;if(o.payload.action==="download_csv"){const l=localStorage.getItem(v)||"[]",h=localStorage.getItem(g)||"[]",d=JSON.parse(l)||[],m=JSON.parse(h)||[];if(d.length>0||m.length>0){const p=G(d,m),i=new Blob(["\uFEFF"+p],{type:"text/csv;charset=utf-8;"}),e=document.createElement("a");if(e.download!==void 0){const c=URL.createObjectURL(i);e.setAttribute("href",c),e.setAttribute("download",`${g}.csv`),e.style.visibility="hidden",document.body.appendChild(e),e.click(),document.body.removeChild(e)}}}if(o.payload.action==="clear"&&(localStorage.removeItem(v),localStorage.removeItem(g),n=0,a=0),o.payload.action==="get_count"){const l=localStorage.getItem(v);l?n=(JSON.parse(l)||[]).length:n=0;const h=localStorage.getItem(g);h?a=(JSON.parse(h)||[]).length:a=0}r({type:"FROM_CONTENT",payload:{zhixiaDataLength:n,shopeeDataLength:a}})}return!0});window.addEventListener("message",function(o){try{const t=JSON.parse(o.data);t.code==="REQUEST_CODE"&&t.data&&t.data.request&&t.data.request.length&&D(t.data.request[0],t)}catch{console.error("Error parsing message data:",o.data)}},!1);function G(o,t){var p,i;const r=((p=document.querySelector(".shopee-category-list .shopee-category-list__main-category__link"))==null?void 0:p.innerText)||"",n=((i=document.querySelector(".shopee-category-list .shopee-category-list__sub-category--active"))==null?void 0:i.innerText)||"",a=t.reduce((e,c)=>(e[c.itemid]=c,e),{}),l=o.map(e=>({...e,...a[e.itemId],firstCategory:r,secondCategory:n})),h=[["imgUrl","图片"],["itemId","商品ID"],["product_url","商品链接/名称"],["catName","类目路径"],["ctime","上架时间"],["sold","总销量"],["sales","近1天销量"],["sales7Day","近7天销量"],["sales30Day","近30天销量"],["gmv30Day","近30天销售额"],["sales30Rate","近30天销量增长率"],["price","实际价格(shopee)"],["shopeeSold","最近30天销量(shopee)"],["shopeeHistoricalSold","历史销量(shopee)"],["shopeeLocation","店铺位置(shopee)"],["tranPrice","价格走势"],["likeCount","点赞数"],["ratingNum","评论数"],["ratingStar","商品评分"],["firstCategory","一级类目"],["keyword","关键词"],["siteName","站点"],["secondCategory","二级类目"],["type","信息来源"]],d=h.map(e=>e[1]),m=l.map(e=>h.map(([c])=>{var u;switch(c){case"tranPrice":return((u=e[c])==null?void 0:u.replace(/[￥~]/g,""))||"";case"sales30Rate":return`${e[c]}%`;case"product_url":return e.product_url||e.itemName;default:return e[c]??""}}).map(c=>`"${String(c).replace(/"/g,'""')}"`).join(","));return[d.join(","),...m].join(`
`)}function _(o=Date.now()){return new Date(o).toLocaleDateString("zh-CN",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit"}).replace(/\//g,"-")}function D(o,t){var n=[{rule:/^.*\/api\/v[0-9].*?\/search\/search_items/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=shop.*?/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=relevancy.*?page_type=search.*?&scenario=.*?/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=ctime.*?page_type=.*?&scenario=PAGE_GLOBAL_SEARCH.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=ctime.*?page_type=.*?&scenario=PAGE_OTHERS.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=sales.*&limit=30|60.*?page_type=.*?&scenario=PAGE_GLOBAL_SEARCH.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=sales.*&limit=30|60.*?page_type=.*?&scenario=PAGE_OTHERS.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=price.*?page_type=.*?&scenario=.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=search.*?&scenario=PAGE_GLOBAL_SEARCH.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=search.*?&scenario=PAGE_CATEGORY.*?/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=ctime.*?page_type=search.*?&scenario=PAGE_CATEGORY.*?/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=sales.*?page_type=search.*?&scenario=PAGE_CATEGORY.*?/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=ctime.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=sales.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=price.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=relevancy.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=relevancy.*?page_type=search.*?&scenario=PAGE_CATEGORY.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=price.*?page_type=search.*?&scenario=PAGE_CATEGORY.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=collection.*?&scenario=PAGE_GLOBAL_SEARCH.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=relevancy.*?page_type=collection.*?&scenario=PAGE_GLOBAL_SEARCH.*/,handler:s},{rule:/^.*\/api\/v[0-9].*?\/recommend\/recommend_v2/,handler:P}].filter(function(a){return a.rule.test(o)});try{n[0].handler(t)}catch(a){a.toString()}}function s(o){var h;const t=o.data.items;if(t.length==0)return;const r=((h=document.querySelector(".shopee-searchbar-input input"))==null?void 0:h.value)||"",n=E(location.host).siteName,a=E(location.host).imgBase,l=t.map(d=>{const{item_basic:m,item_data:p,item_card_displayed_asset:i}=d;if(m){const{sold:e,historical_sold:c,shop_location:u,itemid:y,price:A,ctime:O,name:b,image:C}=m,L=S({itemId:y,shopId:m==null?void 0:m.shopid,itemName:i==null?void 0:i.name});return{shopeeSold:e,shopeeHistoricalSold:c,shopeeLocation:u,itemid:y,price:A/1e5,itemName:b,ctime:_(O*1e3),keyword:r,type:"搜索",product_url:L,img:`${a}/${C}`,siteName:n}}if(p){const{itemid:e,item_card_display_price:c,ctime:u}=p,y=S({itemId:e,shopId:p==null?void 0:p.shopid,itemName:i==null?void 0:i.name});return{shopeeSold:"-",shopeeHistoricalSold:"-",shopeeLocation:i.shop_location,itemid:e,price:c.price/1e5,itemName:i.name,ctime:_(u*1e3),keyword:r,type:"推荐-最热销",product_url:y,img:`${a}/${i.image}`,siteName:n}}});f(l)}function P(o){const t=o.data.data.units;if(t.length==0)return;const r=t.map(({item:n})=>{const{item_data:a,item_card_displayed_asset:l}=n,h=a.item_card_display_sold_count.monthly_sold_count,d=a.item_card_display_sold_count.historical_sold_count,m=a.shop_data.shop_location,p=a.item_card_display_price.item_id,i=a.item_card_display_price.price,e=S({itemId:p,shopId:a==null?void 0:a.shopid,itemName:l==null?void 0:l.name});return{sold:h,historical_sold:d,shop_location:m,itemid:p,price:i,product_url:e,type:"推荐-综合排名"}});f(r)}function f(o){const t=localStorage.getItem(g);let r=[];t&&(r=JSON.parse(t)||[]),r=[...r,...o];const n=new Map(r.map(a=>[a.itemid,a]));r=Array.from(n.values()),localStorage.setItem(g,JSON.stringify(r)),chrome.runtime.sendMessage({type:"STORAGE_UPDATE",payload:{key:"shopeeDataLength",value:r.length}})}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vaGFjay13b3Jrc3BhY2Uvc3JjL2NvbnRlbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLW5vY2hlY2sg6L+B56e777yM5ZCO57ut5YaN5omT5byAXG4vLyDojrflj5blvZPlpKnnmoTlrZjlgqjplK7lkI1cbi8vIOiOt+WPluW9k+WkqeeahOWtmOWCqOmUruWQjVxuY29uc3QgemhpeGlhU3RvcmFnZUtleSA9IGB6aGl4aWFfJHtnZXRDaGluYURhdGUoKX1gO1xuY29uc3Qgc2hvcGVlU3RvcmFnZUtleSA9IGBzaG9wZWVfJHtnZXRDaGluYURhdGUoKX1gO1xuXG5jb25zdCBTaXRlQ29uZmlnID0ge1xuICBUVzoge1xuICAgIHNpdGVOYW1lOiBcIuWPsOa5vlwiLFxuICAgIGhvc3Q6IFwieGlhcGkueGlhcGlidXkuY29tXCIsXG4gICAgaW1nQmFzZTogXCJodHRwczovL2Rvd24tdHcuaW1nLnN1c2VyY29udGVudC5jb20vZmlsZVwiLFxuICB9LFxuICBNQUxBWVNJQToge1xuICAgIHNpdGVOYW1lOiBcIumprOadpeilv+S6mlwiLFxuICAgIGhvc3Q6IFwibXkueGlhcGlidXkuY29tXCIsXG4gICAgaW1nQmFzZTogXCJodHRwczovL2Rvd24tbXkuaW1nLnN1c2VyY29udGVudC5jb20vZmlsZVwiLFxuICB9LFxuICBTSU5HQVBPUkU6IHtcbiAgICBzaXRlTmFtZTogXCLmlrDliqDlnaFcIixcbiAgICBob3N0OiBcInNnLnhpYXBpYnV5LmNvbVwiLFxuICAgIGltZ0Jhc2U6IFwiaHR0cHM6Ly9kb3duLXNnLmltZy5zdXNlcmNvbnRlbnQuY29tL2ZpbGVcIixcbiAgfSxcbiAgUEg6IHtcbiAgICBzaXRlTmFtZTogXCLoj7Llvovlrr5cIixcbiAgICBob3N0OiBcInBoLnhpYXBpYnV5LmNvbVwiLFxuICAgIGltZ0Jhc2U6IFwiaHR0cHM6Ly9kb3duLXBoLmltZy5zdXNlcmNvbnRlbnQuY29tL2ZpbGVcIixcbiAgfSxcbiAgVk46IHtcbiAgICBzaXRlTmFtZTogXCLotorljZdcIixcbiAgICBob3N0OiBcInZuLnhpYXBpYnV5LmNvbVwiLFxuICAgIGltZ0Jhc2U6IFwiaHR0cHM6Ly9kb3duLXZuLmltZy5zdXNlcmNvbnRlbnQuY29tL2ZpbGVcIixcbiAgfSxcbiAgVEg6IHtcbiAgICBzaXRlTmFtZTogXCLms7Dlm71cIixcbiAgICBob3N0OiBcInRoLnhpYXBpYnV5LmNvbVwiLFxuICAgIGltZ0Jhc2U6IFwiaHR0cHM6Ly9kb3duLXRoLmltZy5zdXNlcmNvbnRlbnQuY29tL2ZpbGVcIixcbiAgfSxcbn07XG5cbi8vIOagueaNrue9kemhtSBob3N0IOiOt+WPluermeeCueWQjeensFxuZnVuY3Rpb24gZ2V0U2l0ZUluZm9CeUhvc3QoaG9zdCkge1xuICByZXR1cm4gT2JqZWN0LnZhbHVlcyhTaXRlQ29uZmlnKS5maW5kKChzKSA9PiBob3N0ID09PSBzLmhvc3QpIHx8IHt9O1xufVxuXG4vLyDmoLnmja7ojrflj5bllYblk4Hpk77mjqVcbmZ1bmN0aW9uIGdldFByb2R1Y3RVcmwoeyBpdGVtSWQsIHNob3BJZCwgaXRlbU5hbWUgfSkge1xuICBpZiAoIWl0ZW1JZCB8fCAhc2hvcElkIHx8ICFpdGVtTmFtZSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gYGh0dHBzOi8vJHtsb2NhdGlvbi5ob3N0fS8ke2l0ZW1OYW1lfS1pLiR7c2hvcElkfS4ke2l0ZW1JZH1gO1xufVxuXG4vLyBjb250ZW50LmpzIOaOpeaUtnBvcHVw5pON5L2c5raI5oGvXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gIGlmIChyZXF1ZXN0LnR5cGUgPT09IFwiRlJPTV9QT1BVUFwiKSB7XG4gICAgbGV0IHpoaXhpYURhdGFMZW5ndGggPSAwO1xuICAgIGxldCBzaG9wZWVEYXRhTGVuZ3RoID0gMDtcbiAgICBpZiAocmVxdWVzdC5wYXlsb2FkLmFjdGlvbiA9PT0gXCJkb3dubG9hZF9jc3ZcIikge1xuICAgICAgY29uc3QgemhpeGlhRGF0YSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHpoaXhpYVN0b3JhZ2VLZXkpIHx8IFwiW11cIjtcbiAgICAgIGNvbnN0IHNob3BlZURhdGEgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShzaG9wZWVTdG9yYWdlS2V5KSB8fCBcIltdXCI7XG5cbiAgICAgIGNvbnN0IHBhcnNlZFpoaXhpYURhdGEgPSBKU09OLnBhcnNlKHpoaXhpYURhdGEpIHx8IFtdO1xuICAgICAgY29uc3QgcGFyc2VkU2hvcGVlRGF0YSA9IEpTT04ucGFyc2Uoc2hvcGVlRGF0YSkgfHwgW107XG5cbiAgICAgIGlmIChwYXJzZWRaaGl4aWFEYXRhLmxlbmd0aCA+IDAgfHwgcGFyc2VkU2hvcGVlRGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIOWwhuaVsOaNrui9rOaNouS4uiBDU1Yg5qC85byPXG4gICAgICAgIGNvbnN0IGNzdkNvbnRlbnQgPSBjb252ZXJ0VG9DU1YocGFyc2VkWmhpeGlhRGF0YSwgcGFyc2VkU2hvcGVlRGF0YSk7XG4gICAgICAgIC8vIOWIm+W7uuS4i+i9vemTvuaOpVxuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW1wiXFx1RkVGRlwiICsgY3N2Q29udGVudF0sIHtcbiAgICAgICAgICB0eXBlOiBcInRleHQvY3N2O2NoYXJzZXQ9dXRmLTg7XCIsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgIGlmIChsaW5rLmRvd25sb2FkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCB1cmwpO1xuICAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwiZG93bmxvYWRcIiwgYCR7c2hvcGVlU3RvcmFnZUtleX0uY3N2YCk7XG4gICAgICAgICAgbGluay5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmspO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXF1ZXN0LnBheWxvYWQuYWN0aW9uID09PSBcImNsZWFyXCIpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHpoaXhpYVN0b3JhZ2VLZXkpO1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oc2hvcGVlU3RvcmFnZUtleSk7XG4gICAgICB6aGl4aWFEYXRhTGVuZ3RoID0gMDtcbiAgICAgIHNob3BlZURhdGFMZW5ndGggPSAwO1xuICAgIH1cbiAgICBpZiAocmVxdWVzdC5wYXlsb2FkLmFjdGlvbiA9PT0gXCJnZXRfY291bnRcIikge1xuICAgICAgY29uc3QgemhpeGlhRGF0YSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHpoaXhpYVN0b3JhZ2VLZXkpO1xuICAgICAgaWYgKHpoaXhpYURhdGEpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UoemhpeGlhRGF0YSkgfHwgW107XG4gICAgICAgIHpoaXhpYURhdGFMZW5ndGggPSBwYXJzZWREYXRhLmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHpoaXhpYURhdGFMZW5ndGggPSAwO1xuICAgICAgfVxuICAgICAgY29uc3Qgc2hvcGVlRGF0YSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHNob3BlZVN0b3JhZ2VLZXkpO1xuICAgICAgaWYgKHNob3BlZURhdGEpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2Uoc2hvcGVlRGF0YSkgfHwgW107XG4gICAgICAgIHNob3BlZURhdGFMZW5ndGggPSBwYXJzZWREYXRhLmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNob3BlZURhdGFMZW5ndGggPSAwO1xuICAgICAgfVxuICAgIH1cbiAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgdHlwZTogXCJGUk9NX0NPTlRFTlRcIixcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgemhpeGlhRGF0YUxlbmd0aCxcbiAgICAgICAgc2hvcGVlRGF0YUxlbmd0aCxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHRydWU7IC8vIOS/neaMgemVv+i/nuaOpVxufSk7XG5cbi8vIOWKq+aMgXNob3BlZeivt+axglxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gIFwibWVzc2FnZVwiLFxuICBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAvLyDnoa7kv53mtojmga/mnaXmupDmmK/lvZPliY3nqpflj6NcbiAgICB0cnkge1xuICAgICAgLy8g6Kej5p6Q5o6l5pS25Yiw55qE5raI5oGv5pWw5o2uXG4gICAgICBjb25zdCBldmVudERhdGEgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXG4gICAgICBpZiAoZXZlbnREYXRhLmNvZGUgPT09IFwiUkVRVUVTVF9DT0RFXCIpIHtcbiAgICAgICAgLy8g5aSE55CG5o6l5pS25Yiw55qE5pWw5o2uXG4gICAgICAgIGlmIChcbiAgICAgICAgICBldmVudERhdGEuZGF0YSAmJlxuICAgICAgICAgIGV2ZW50RGF0YS5kYXRhLnJlcXVlc3QgJiZcbiAgICAgICAgICBldmVudERhdGEuZGF0YS5yZXF1ZXN0Lmxlbmd0aFxuICAgICAgICApIHtcbiAgICAgICAgICBzaG9wZWVIYW5kbGVyKGV2ZW50RGF0YS5kYXRhLnJlcXVlc3RbMF0sIGV2ZW50RGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8g6L+Z6YeM5Y+v5Lul5re75Yqg5L2g5aSE55CG5pWw5o2u55qE6YC76L6RXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBwYXJzaW5nIG1lc3NhZ2UgZGF0YTpcIiwgZXZlbnQuZGF0YSk7XG4gICAgfVxuICB9LFxuICBmYWxzZVxuKTtcblxuLy8g5bCG5pWw57uE6L2s5o2i5Li6IENTViDmoLzlvI9cbmZ1bmN0aW9uIGNvbnZlcnRUb0NTVih6aGl4aWFEYXRhLCBzaG9wZWVEYXRhKSB7XG4gIGNvbnN0IGZpcnN0Q2F0ZWdvcnkgPVxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBcIi5zaG9wZWUtY2F0ZWdvcnktbGlzdCAuc2hvcGVlLWNhdGVnb3J5LWxpc3RfX21haW4tY2F0ZWdvcnlfX2xpbmtcIlxuICAgICk/LmlubmVyVGV4dCB8fCBcIlwiO1xuICBjb25zdCBzZWNvbmRDYXRlZ29yeSA9XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgIFwiLnNob3BlZS1jYXRlZ29yeS1saXN0IC5zaG9wZWUtY2F0ZWdvcnktbGlzdF9fc3ViLWNhdGVnb3J5LS1hY3RpdmVcIlxuICAgICk/LmlubmVyVGV4dCB8fCBcIlwiO1xuXG4gIGNvbnN0IHNob3BlZURhdGFNYXAgPSBzaG9wZWVEYXRhLnJlZHVjZSgoYWNjLCBpdGVtKSA9PiB7XG4gICAgYWNjW2l0ZW0uaXRlbWlkXSA9IGl0ZW07XG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xuICBjb25zdCBhcnIgPSB6aGl4aWFEYXRhLm1hcCgoaXRlbSkgPT4ge1xuICAgIC8vIOS8mOWFiOS9v+eUqHNob3BlZeaVsOaNrlxuICAgIHJldHVybiB7XG4gICAgICAuLi5pdGVtLFxuICAgICAgLi4uc2hvcGVlRGF0YU1hcFtpdGVtLml0ZW1JZF0sXG4gICAgICBmaXJzdENhdGVnb3J5LFxuICAgICAgc2Vjb25kQ2F0ZWdvcnksXG4gICAgfTtcbiAgfSk7XG5cbiAgLy8g5a6a5LmJ5Zu65a6a5YiX6aG65bqP77yI5qC55o2u5a6e6ZmF5pWw5o2u57uT5p6E6LCD5pW077yJXG4gIGNvbnN0IGZpZWxkTWFwcGluZyA9IFtcbiAgICBbXCJpbWdVcmxcIiwgXCLlm77niYdcIl0sXG4gICAgW1wiaXRlbUlkXCIsIFwi5ZWG5ZOBSURcIl0sXG4gICAgW1wicHJvZHVjdF91cmxcIiwgXCLllYblk4Hpk77mjqUv5ZCN56ewXCJdLFxuICAgIFtcImNhdE5hbWVcIiwgXCLnsbvnm67ot6/lvoRcIl0sXG4gICAgW1wiY3RpbWVcIiwgXCLkuIrmnrbml7bpl7RcIl0sXG4gICAgW1wic29sZFwiLCBcIuaAu+mUgOmHj1wiXSxcbiAgICBbXCJzYWxlc1wiLCBcIui/kTHlpKnplIDph49cIl0sXG4gICAgW1wic2FsZXM3RGF5XCIsIFwi6L+RN+WkqemUgOmHj1wiXSxcbiAgICBbXCJzYWxlczMwRGF5XCIsIFwi6L+RMzDlpKnplIDph49cIl0sXG4gICAgW1wiZ212MzBEYXlcIiwgXCLov5EzMOWkqemUgOWUruminVwiXSxcbiAgICBbXCJzYWxlczMwUmF0ZVwiLCBcIui/kTMw5aSp6ZSA6YeP5aKe6ZW/546HXCJdLFxuICAgIFtcInByaWNlXCIsIFwi5a6e6ZmF5Lu35qC8KHNob3BlZSlcIl0sXG4gICAgW1wic2hvcGVlU29sZFwiLCBcIuacgOi/kTMw5aSp6ZSA6YePKHNob3BlZSlcIl0sXG4gICAgW1wic2hvcGVlSGlzdG9yaWNhbFNvbGRcIiwgXCLljoblj7LplIDph48oc2hvcGVlKVwiXSxcbiAgICBbXCJzaG9wZWVMb2NhdGlvblwiLCBcIuW6l+mTuuS9jee9rihzaG9wZWUpXCJdLFxuICAgIFtcInRyYW5QcmljZVwiLCBcIuS7t+agvOi1sOWKv1wiXSxcbiAgICBbXCJsaWtlQ291bnRcIiwgXCLngrnotZ7mlbBcIl0sXG4gICAgW1wicmF0aW5nTnVtXCIsIFwi6K+E6K665pWwXCJdLFxuICAgIFtcInJhdGluZ1N0YXJcIiwgXCLllYblk4Hor4TliIZcIl0sXG4gICAgW1wiZmlyc3RDYXRlZ29yeVwiLCBcIuS4gOe6p+exu+ebrlwiXSxcbiAgICBbXCJrZXl3b3JkXCIsIFwi5YWz6ZSu6K+NXCJdLFxuICAgIFtcInNpdGVOYW1lXCIsIFwi56uZ54K5XCJdLFxuICAgIFtcInNlY29uZENhdGVnb3J5XCIsIFwi5LqM57qn57G755uuXCJdLFxuICAgIFtcInR5cGVcIiwgXCLkv6Hmga/mnaXmupBcIl1cbiAgXTtcbiAgY29uc3QgaGVhZGVycyA9IGZpZWxkTWFwcGluZy5tYXAoKGYpID0+IGZbMV0pO1xuICAvLyDliJvlu7ogQ1NWIOWGheWuuVxuICBjb25zdCByb3dzID0gYXJyLm1hcCgoaXRlbSkgPT4ge1xuICAgIHJldHVybiBmaWVsZE1hcHBpbmdcbiAgICAgIC5tYXAoKFtmaWVsZF0pID0+IHtcbiAgICAgICAgLy8g54m55q6K5a2X5q615aSE55CGXG4gICAgICAgIHN3aXRjaCAoZmllbGQpIHtcbiAgICAgICAgICBjYXNlIFwidHJhblByaWNlXCI6XG4gICAgICAgICAgICByZXR1cm4gaXRlbVtmaWVsZF0/LnJlcGxhY2UoL1vvv6V+XS9nLCBcIlwiKSB8fCBcIlwiO1xuICAgICAgICAgIGNhc2UgXCJzYWxlczMwUmF0ZVwiOlxuICAgICAgICAgICAgcmV0dXJuIGAke2l0ZW1bZmllbGRdfSVgO1xuICAgICAgICAgIGNhc2UgXCJwcm9kdWN0X3VybFwiOlxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0ucHJvZHVjdF91cmwgfHwgaXRlbS5pdGVtTmFtZTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGl0ZW1bZmllbGRdID8/IFwiXCI7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAubWFwKCh2KSA9PiBgXCIke1N0cmluZyh2KS5yZXBsYWNlKC9cIi9nLCAnXCJcIicpfVwiYClcbiAgICAgIC5qb2luKFwiLFwiKTtcbiAgfSk7XG5cbiAgcmV0dXJuIFtoZWFkZXJzLmpvaW4oXCIsXCIpLCAuLi5yb3dzXS5qb2luKFwiXFxuXCIpO1xufVxuXG4vLyDojrflj5blvZPliY3kuK3lm73ml6XmnJ9cbmZ1bmN0aW9uIGdldENoaW5hRGF0ZSh0aW1lID0gRGF0ZS5ub3coKSkge1xuICByZXR1cm4gbmV3IERhdGUodGltZSlcbiAgICAudG9Mb2NhbGVEYXRlU3RyaW5nKFwiemgtQ05cIiwge1xuICAgICAgdGltZVpvbmU6IFwiQXNpYS9TaGFuZ2hhaVwiLFxuICAgICAgeWVhcjogXCJudW1lcmljXCIsXG4gICAgICBtb250aDogXCIyLWRpZ2l0XCIsXG4gICAgICBkYXk6IFwiMi1kaWdpdFwiLFxuICAgIH0pXG4gICAgLnJlcGxhY2UoL1xcLy9nLCBcIi1cIik7IC8vIOi+k+WHuuagvOW8j++8mnl5eXktbW0tZGRcbn1cblxuLyoqXG4gKiDnvZHlhbPliIblj5FcbiAqIEBwYXJhbSB1cmxcbiAqIEBwYXJhbSByZXN1bHREYXRhXG4gKi9cbmZ1bmN0aW9uIHNob3BlZUhhbmRsZXIodXJsLCByZXN1bHREYXRhKSB7XG4gIGxldCBydWxlcyA9IFtcbiAgICB7XG4gICAgICBydWxlOiAvXi4qXFwvYXBpXFwvdlswLTldLio/XFwvc2VhcmNoXFwvc2VhcmNoX2l0ZW1zLyxcbiAgICAgIGhhbmRsZXI6IHNob3BlZUdldExpc3QsXG4gICAgfSxcbiAgICB7XG4gICAgICBydWxlOiAvXi4qXFwvYXBpXFwvdlswLTldLio/XFwvc2VhcmNoX2l0ZW1zKFxcLyk/XFw/Ynk9cG9wLio/cGFnZV90eXBlPXNob3AuKj8vLFxuICAgICAgaGFuZGxlcjogc2hvcGVlR2V0TGlzdCxcbiAgICB9LFxuICAgIHtcbiAgICAgIHJ1bGU6IC9eLipcXC9hcGlcXC92WzAtOV0uKj9cXC9zZWFyY2hfaXRlbXMoXFwvKT9cXD9ieT1yZWxldmFuY3kuKj9wYWdlX3R5cGU9c2VhcmNoLio/JnNjZW5hcmlvPS4qPy8sXG4gICAgICBoYW5kbGVyOiBzaG9wZWVHZXRMaXN0LFxuICAgIH0sXG4gICAge1xuICAgICAgcnVsZTogL14uKlxcL2FwaVxcL3ZbMC05XS4qP1xcL3NlYXJjaF9pdGVtcyhcXC8pP1xcP2J5PWN0aW1lLio/cGFnZV90eXBlPS4qPyZzY2VuYXJpbz1QQUdFX0dMT0JBTF9TRUFSQ0guKi8sXG4gICAgICBoYW5kbGVyOiBzaG9wZWVHZXRMaXN0LFxuICAgIH0sXG4gICAge1xuICAgICAgcnVsZTogL14uKlxcL2FwaVxcL3ZbMC05XS4qP1xcL3NlYXJjaF9pdGVtcyhcXC8pP1xcP2J5PWN0aW1lLio/cGFnZV90eXBlPS4qPyZzY2VuYXJpbz1QQUdFX09USEVSUy4qLyxcbiAgICAgIGhhbmRsZXI6IHNob3BlZUdldExpc3QsXG4gICAgfSxcbiAgICB7XG4gICAgICBydWxlOiAvXi4qXFwvYXBpXFwvdlswLTldLio/XFwvc2VhcmNoX2l0ZW1zKFxcLyk/XFw/Ynk9c2FsZXMuKiZsaW1pdD0zMHw2MC4qP3BhZ2VfdHlwZT0uKj8mc2NlbmFyaW89UEFHRV9HTE9CQUxfU0VBUkNILiovLFxuICAgICAgaGFuZGxlcjogc2hvcGVlR2V0TGlzdCxcbiAgICB9LFxuICAgIHtcbiAgICAgIHJ1bGU6IC9eLipcXC9hcGlcXC92WzAtOV0uKj9cXC9zZWFyY2hfaXRlbXMoXFwvKT9cXD9ieT1zYWxlcy4qJmxpbWl0PTMwfDYwLio/cGFnZV90eXBlPS4qPyZzY2VuYXJpbz1QQUdFX09USEVSUy4qLyxcbiAgICAgIGhhbmRsZXI6IHNob3BlZUdldExpc3QsXG4gICAgfSxcbiAgICB7XG4gICAgICBydWxlOiAvXi4qXFwvYXBpXFwvdlswLTldLio/XFwvc2VhcmNoX2l0ZW1zKFxcLyk/XFw/Ynk9cHJpY2UuKj9wYWdlX3R5cGU9Lio/JnNjZW5hcmlvPS4qLyxcbiAgICAgIGhhbmRsZXI6IHNob3BlZUdldExpc3QsXG4gICAgfSxcbiAgICB7XG4gICAgICBydWxlOiAvXi4qXFwvYXBpXFwvdlswLTldLio/XFwvc2VhcmNoX2l0ZW1zKFxcLyk/XFw/Ynk9cG9wLio/cGFnZV90eXBlPXNlYXJjaC4qPyZzY2VuYXJpbz1QQUdFX0dMT0JBTF9TRUFSQ0guKi8sXG4gICAgICBoYW5kbGVyOiBzaG9wZWVHZXRMaXN0LFxuICAgIH0sXG4gICAge1xuICAgICAgcnVsZTogL14uKlxcL2FwaVxcL3ZbMC05XS4qP1xcL3NlYXJjaF9pdGVtcyhcXC8pP1xcP2J5PXBvcC4qP3BhZ2VfdHlwZT1zZWFyY2guKj8mc2NlbmFyaW89UEFHRV9DQVRFR09SWS4qPy8sXG4gICAgICBoYW5kbGVyOiBzaG9wZWVHZXRMaXN0LFxuICAgIH0sXG4gICAge1xuICAgICAgcnVsZTogL14uKlxcL2FwaVxcL3ZbMC05XS4qP1xcL3NlYXJjaF9pdGVtcyhcXC8pP1xcP2J5PWN0aW1lLio/cGFnZV90eXBlPXNlYXJjaC4qPyZzY2VuYXJpbz1QQUdFX0NBVEVHT1JZLio/LyxcbiAgICAgIGhhbmRsZXI6IHNob3BlZUdldExpc3QsXG4gICAgfSxcbiAgICB7XG4gICAgICBydWxlOiAvXi4qXFwvYXBpXFwvdlswLTldLio/XFwvc2VhcmNoX2l0ZW1zKFxcLyk/XFw/Ynk9c2FsZXMuKj9wYWdlX3R5cGU9c2VhcmNoLio/JnNjZW5hcmlvPVBBR0VfQ0FURUdPUlkuKj8vLFxuICAgICAgaGFuZGxlcjogc2hvcGVlR2V0TGlzdCxcbiAgICB9LFxuICAgIHtcbiAgICAgIHJ1bGU6IC9eLipcXC9hcGlcXC92WzAtOV0uKj9cXC9zZWFyY2hfaXRlbXMoXFwvKT9cXD9ieT1wb3AuKj9wYWdlX3R5cGU9Y29sbGVjdGlvbi4qPyZzY2VuYXJpbz1QQUdFX0NPTExFQ1RJT04uKi8sXG4gICAgICBoYW5kbGVyOiBzaG9wZWVHZXRMaXN0LFxuICAgIH0sXG4gICAge1xuICAgICAgcnVsZTogL14uKlxcL2FwaVxcL3ZbMC05XS4qP1xcL3NlYXJjaF9pdGVtcyhcXC8pP1xcP2J5PWN0aW1lLio/cGFnZV90eXBlPWNvbGxlY3Rpb24uKj8mc2NlbmFyaW89UEFHRV9DT0xMRUNUSU9OLiovLFxuICAgICAgaGFuZGxlcjogc2hvcGVlR2V0TGlzdCxcbiAgICB9LFxuICAgIHtcbiAgICAgIHJ1bGU6IC9eLipcXC9hcGlcXC92WzAtOV0uKj9cXC9zZWFyY2hfaXRlbXMoXFwvKT9cXD9ieT1zYWxlcy4qP3BhZ2VfdHlwZT1jb2xsZWN0aW9uLio/JnNjZW5hcmlvPVBBR0VfQ09MTEVDVElPTi4qLyxcbiAgICAgIGhhbmRsZXI6IHNob3BlZUdldExpc3QsXG4gICAgfSxcbiAgICB7XG4gICAgICBydWxlOiAvXi4qXFwvYXBpXFwvdlswLTldLio/XFwvc2VhcmNoX2l0ZW1zKFxcLyk/XFw/Ynk9cHJpY2UuKj9wYWdlX3R5cGU9Y29sbGVjdGlvbi4qPyZzY2VuYXJpbz1QQUdFX0NPTExFQ1RJT04uKi8sXG4gICAgICBoYW5kbGVyOiBzaG9wZWVHZXRMaXN0LFxuICAgIH0sXG4gICAge1xuICAgICAgcnVsZTogL14uKlxcL2FwaVxcL3ZbMC05XS4qP1xcL3NlYXJjaF9pdGVtcyhcXC8pP1xcP2J5PXJlbGV2YW5jeS4qP3BhZ2VfdHlwZT1jb2xsZWN0aW9uLio/JnNjZW5hcmlvPVBBR0VfQ09MTEVDVElPTi4qLyxcbiAgICAgIGhhbmRsZXI6IHNob3BlZUdldExpc3QsXG4gICAgfSxcbiAgICB7XG4gICAgICBydWxlOiAvXi4qXFwvYXBpXFwvdlswLTldLio/XFwvc2VhcmNoX2l0ZW1zKFxcLyk/XFw/Ynk9cmVsZXZhbmN5Lio/cGFnZV90eXBlPXNlYXJjaC4qPyZzY2VuYXJpbz1QQUdFX0NBVEVHT1JZLiovLFxuICAgICAgaGFuZGxlcjogc2hvcGVlR2V0TGlzdCxcbiAgICB9LFxuICAgIHtcbiAgICAgIHJ1bGU6IC9eLipcXC9hcGlcXC92WzAtOV0uKj9cXC9zZWFyY2hfaXRlbXMoXFwvKT9cXD9ieT1wcmljZS4qP3BhZ2VfdHlwZT1zZWFyY2guKj8mc2NlbmFyaW89UEFHRV9DQVRFR09SWS4qLyxcbiAgICAgIGhhbmRsZXI6IHNob3BlZUdldExpc3QsXG4gICAgfSxcbiAgICB7XG4gICAgICBydWxlOiAvXi4qXFwvYXBpXFwvdlswLTldLio/XFwvc2VhcmNoX2l0ZW1zKFxcLyk/XFw/Ynk9cG9wLio/cGFnZV90eXBlPWNvbGxlY3Rpb24uKj8mc2NlbmFyaW89UEFHRV9HTE9CQUxfU0VBUkNILiovLFxuICAgICAgaGFuZGxlcjogc2hvcGVlR2V0TGlzdCxcbiAgICB9LFxuICAgIHtcbiAgICAgIHJ1bGU6IC9eLipcXC9hcGlcXC92WzAtOV0uKj9cXC9zZWFyY2hfaXRlbXMoXFwvKT9cXD9ieT1yZWxldmFuY3kuKj9wYWdlX3R5cGU9Y29sbGVjdGlvbi4qPyZzY2VuYXJpbz1QQUdFX0dMT0JBTF9TRUFSQ0guKi8sXG4gICAgICBoYW5kbGVyOiBzaG9wZWVHZXRMaXN0LFxuICAgIH0sXG4gICAge1xuICAgICAgcnVsZTogL14uKlxcL2FwaVxcL3ZbMC05XS4qP1xcL3JlY29tbWVuZFxcL3JlY29tbWVuZF92Mi8sXG4gICAgICBoYW5kbGVyOiBzaG9wZWVHZXRIZExpc3QsXG4gICAgfSxcbiAgICAvLyB7XG4gICAgLy8gICAgIHJ1bGU6IC9eLipcXC9hcGlcXC92WzAtOV0uKj9cXC9yY21kX2l0ZW1zKFxcLyk/XFw/YnVuZGxlPS4qJmxpbWl0PS4qJm9mZnNldD0uKiZzaG9wX2lkPS4qJnNvcnRfdHlwZT0uKiZ1cHN0cmVhbT0uKi8sXG4gICAgLy8gICAgIGhhbmRsZXI6IGdldFNob3BJdGVtTGlzdFxuICAgIC8vIH0sXG4gICAgLy8ge1xuICAgIC8vICAgICBydWxlOiAvXi4qXFwvYXBpXFwvdlswLTldLio/XFwvc2hvcFxcL3JjbWRfaXRlbXMuKi8sXG4gICAgLy8gICAgIGhhbmRsZXI6IGdldFNob3BJdGVtTGlzdFxuICAgIC8vIH0sXG4gICAgLy8ge1xuICAgIC8vICAgICBydWxlOiAvXi4qXFwvYXBpXFwvdlswLTldLio/XFwvaG9tZXBhZ2VcXC9nZXRfZGFpbHlfZGlzY292ZXJcXD9idW5kbGU9LiomaXRlbV9jYXJkPS4qJmxpbWl0PS4qJm5lZWRfdGFiPS4qJm9mZnNldD0uKiZ2aWV3X3Nlc3Npb25faWQ9LiovLFxuICAgIC8vICAgICBoYW5kbGVyOiBnZXRIb21lSXRlbUxpc3RcbiAgICAvLyB9LFxuICAgIC8vIHtcbiAgICAvLyAgICAgcnVsZTogL14uKlxcL2FwaVxcL3ZbMC05XS4qP1xcL3JlY29tbWVuZFxcL3Byb2R1Y3RfZGV0YWlsX3BhZ2UuKi8sXG4gICAgLy8gICAgIGhhbmRsZXI6IGdldFNpbWlsYXJJdGVtTGlzdFxuICAgIC8vIH0sXG4gICAgLy8ge1xuICAgIC8vICAgICBydWxlOiAvXi4qXFwvYXBpXFwvdlswLTldLio/XFwvcmVjb21tZW5kXFwvcmVjb21tZW5kX3Bvc3QuKi8sXG4gICAgLy8gICAgIGhhbmRsZXI6IGdldEZpbmRTaW1pbGFyUHJvZHVjdHNcbiAgICAvLyB9XG4gIF07XG4gIHZhciBoYW5kbGVycyA9IHJ1bGVzLmZpbHRlcihmdW5jdGlvbiAodikge1xuICAgIHJldHVybiB2LnJ1bGUudGVzdCh1cmwpO1xuICB9KTtcbiAgdHJ5IHtcbiAgICBoYW5kbGVyc1swXS5oYW5kbGVyKHJlc3VsdERhdGEpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZS50b1N0cmluZygpO1xuICB9XG59XG5cbi8vIOiOt+WPluaQnOe0ouaVsOaNrlxuZnVuY3Rpb24gc2hvcGVlR2V0TGlzdChyZXN1bHREYXRhKSB7XG4gIGNvbnN0IGxpc3QgPSByZXN1bHREYXRhLmRhdGEuaXRlbXM7XG4gIGlmIChsaXN0Lmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIOiOt+WPluW9k+WJjemhtemdouS4iueahOWFs+mUruivjVxuICBjb25zdCBrZXl3b3JkID1cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNob3BlZS1zZWFyY2hiYXItaW5wdXQgaW5wdXRcIik/LnZhbHVlIHx8IFwiXCI7XG5cbiAgY29uc3Qgc2l0ZU5hbWUgPSBnZXRTaXRlSW5mb0J5SG9zdChsb2NhdGlvbi5ob3N0KS5zaXRlTmFtZTtcbiAgY29uc3QgaW1nQmFzZSA9IGdldFNpdGVJbmZvQnlIb3N0KGxvY2F0aW9uLmhvc3QpLmltZ0Jhc2U7XG5cbiAgY29uc3QgZGF0YSA9IGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgY29uc3QgeyBpdGVtX2Jhc2ljLCBpdGVtX2RhdGEsIGl0ZW1fY2FyZF9kaXNwbGF5ZWRfYXNzZXQgfSA9IGl0ZW07XG4gICAgLy8g5pCc57SiXG4gICAgaWYgKGl0ZW1fYmFzaWMpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgc29sZCxcbiAgICAgICAgaGlzdG9yaWNhbF9zb2xkLFxuICAgICAgICBzaG9wX2xvY2F0aW9uLFxuICAgICAgICBpdGVtaWQsXG4gICAgICAgIHByaWNlLFxuICAgICAgICBjdGltZSxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgaW1hZ2VcbiAgICAgIH0gPSBpdGVtX2Jhc2ljO1xuXG4gICAgICBjb25zdCBwcm9kdWN0X3VybCA9IGdldFByb2R1Y3RVcmwoe1xuICAgICAgICBpdGVtSWQ6IGl0ZW1pZCxcbiAgICAgICAgc2hvcElkOiBpdGVtX2Jhc2ljPy5zaG9waWQsXG4gICAgICAgIGl0ZW1OYW1lOiBpdGVtX2NhcmRfZGlzcGxheWVkX2Fzc2V0Py5uYW1lLFxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNob3BlZVNvbGQ6IHNvbGQsXG4gICAgICAgIHNob3BlZUhpc3RvcmljYWxTb2xkOiBoaXN0b3JpY2FsX3NvbGQsXG4gICAgICAgIHNob3BlZUxvY2F0aW9uOiBzaG9wX2xvY2F0aW9uLFxuICAgICAgICBpdGVtaWQsXG4gICAgICAgIHByaWNlOiBwcmljZSAvIDEwMDAwMCxcbiAgICAgICAgaXRlbU5hbWU6IG5hbWUsXG4gICAgICAgIGN0aW1lOiBnZXRDaGluYURhdGUoY3RpbWUgKiAxMDAwKSxcbiAgICAgICAga2V5d29yZCxcbiAgICAgICAgdHlwZTogXCLmkJzntKJcIixcbiAgICAgICAgcHJvZHVjdF91cmwsXG4gICAgICAgIGltZzogYCR7aW1nQmFzZX0vJHtpbWFnZX1gLFxuICAgICAgICBzaXRlTmFtZSxcbiAgICAgIH07XG4gICAgfVxuICAgIC8vIOaOqOiNkC3mnIDng63plIBcbiAgICBpZiAoaXRlbV9kYXRhKSB7XG4gICAgICBjb25zdCB7IGl0ZW1pZCwgaXRlbV9jYXJkX2Rpc3BsYXlfcHJpY2UsIGN0aW1lIH0gPSBpdGVtX2RhdGE7XG5cbiAgICAgIGNvbnN0IHByb2R1Y3RfdXJsID0gZ2V0UHJvZHVjdFVybCh7XG4gICAgICAgIGl0ZW1JZDogaXRlbWlkLFxuICAgICAgICBzaG9wSWQ6IGl0ZW1fZGF0YT8uc2hvcGlkLFxuICAgICAgICBpdGVtTmFtZTogaXRlbV9jYXJkX2Rpc3BsYXllZF9hc3NldD8ubmFtZSxcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzaG9wZWVTb2xkOiBcIi1cIixcbiAgICAgICAgc2hvcGVlSGlzdG9yaWNhbFNvbGQ6IFwiLVwiLFxuICAgICAgICBzaG9wZWVMb2NhdGlvbjogaXRlbV9jYXJkX2Rpc3BsYXllZF9hc3NldC5zaG9wX2xvY2F0aW9uLFxuICAgICAgICBpdGVtaWQsXG4gICAgICAgIHByaWNlOiBpdGVtX2NhcmRfZGlzcGxheV9wcmljZS5wcmljZSAvIDEwMDAwMCxcbiAgICAgICAgaXRlbU5hbWU6IGl0ZW1fY2FyZF9kaXNwbGF5ZWRfYXNzZXQubmFtZSxcbiAgICAgICAgY3RpbWU6IGdldENoaW5hRGF0ZShjdGltZSAqIDEwMDApLFxuICAgICAgICBrZXl3b3JkLFxuICAgICAgICB0eXBlOiBcIuaOqOiNkC3mnIDng63plIBcIixcbiAgICAgICAgcHJvZHVjdF91cmwsXG4gICAgICAgIGltZzogYCR7aW1nQmFzZX0vJHtpdGVtX2NhcmRfZGlzcGxheWVkX2Fzc2V0LmltYWdlfWAsXG4gICAgICAgIHNpdGVOYW1lLFxuICAgICAgfTtcbiAgICB9XG4gIH0pO1xuICBzdG9yZVNob3BlZURhdGEoZGF0YSk7XG59XG5cbi8vIOiOt+WPluaOqOiNkOaVsOaNrlxuZnVuY3Rpb24gc2hvcGVlR2V0SGRMaXN0KHJlc3VsdERhdGEpIHtcbiAgY29uc3QgbGlzdCA9IHJlc3VsdERhdGEuZGF0YS5kYXRhLnVuaXRzO1xuICBpZiAobGlzdC5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSBsaXN0Lm1hcCgoeyBpdGVtIH0pID0+IHtcblxuICAgIGNvbnN0IHsgaXRlbV9kYXRhLCBpdGVtX2NhcmRfZGlzcGxheWVkX2Fzc2V0IH0gPSBpdGVtO1xuICAgIGNvbnN0IHNvbGQgPSBpdGVtX2RhdGEuaXRlbV9jYXJkX2Rpc3BsYXlfc29sZF9jb3VudC5tb250aGx5X3NvbGRfY291bnQ7XG4gICAgY29uc3QgaGlzdG9yaWNhbF9zb2xkID1cbiAgICAgIGl0ZW1fZGF0YS5pdGVtX2NhcmRfZGlzcGxheV9zb2xkX2NvdW50Lmhpc3RvcmljYWxfc29sZF9jb3VudDtcbiAgICBjb25zdCBzaG9wX2xvY2F0aW9uID0gaXRlbV9kYXRhLnNob3BfZGF0YS5zaG9wX2xvY2F0aW9uO1xuICAgIGNvbnN0IGl0ZW1pZCA9IGl0ZW1fZGF0YS5pdGVtX2NhcmRfZGlzcGxheV9wcmljZS5pdGVtX2lkO1xuICAgIGNvbnN0IHByaWNlID0gaXRlbV9kYXRhLml0ZW1fY2FyZF9kaXNwbGF5X3ByaWNlLnByaWNlO1xuICAgIGNvbnN0IHByb2R1Y3RfdXJsID0gZ2V0UHJvZHVjdFVybCh7XG4gICAgICBpdGVtSWQ6IGl0ZW1pZCxcbiAgICAgIHNob3BJZDogaXRlbV9kYXRhPy5zaG9waWQsXG4gICAgICBpdGVtTmFtZTogaXRlbV9jYXJkX2Rpc3BsYXllZF9hc3NldD8ubmFtZSxcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBzb2xkLFxuICAgICAgaGlzdG9yaWNhbF9zb2xkLFxuICAgICAgc2hvcF9sb2NhdGlvbixcbiAgICAgIGl0ZW1pZCxcbiAgICAgIHByaWNlLFxuICAgICAgcHJvZHVjdF91cmwsXG4gICAgICB0eXBlOiBcIuaOqOiNkC3nu7zlkIjmjpLlkI1cIixcbiAgICB9O1xuICB9KTtcbiAgc3RvcmVTaG9wZWVEYXRhKGRhdGEpO1xufVxuXG5mdW5jdGlvbiBzdG9yZVNob3BlZURhdGEobmV3RGF0YSkge1xuICBjb25zdCBzdG9yZWREYXRhID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oc2hvcGVlU3RvcmFnZUtleSk7XG4gIGxldCBwYXJzZWREYXRhID0gW107XG4gIGlmIChzdG9yZWREYXRhKSB7XG4gICAgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2Uoc3RvcmVkRGF0YSkgfHwgW107XG4gIH1cbiAgcGFyc2VkRGF0YSA9IFsuLi5wYXJzZWREYXRhLCAuLi5uZXdEYXRhXTtcbiAgLy8g5Y676YeNXG4gIGNvbnN0IGl0ZW1NYXAgPSBuZXcgTWFwKHBhcnNlZERhdGEubWFwKChpdGVtKSA9PiBbaXRlbS5pdGVtaWQsIGl0ZW1dKSk7XG4gIHBhcnNlZERhdGEgPSBBcnJheS5mcm9tKGl0ZW1NYXAudmFsdWVzKCkpO1xuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShzaG9wZWVTdG9yYWdlS2V5LCBKU09OLnN0cmluZ2lmeShwYXJzZWREYXRhKSk7XG4gIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICB0eXBlOiBcIlNUT1JBR0VfVVBEQVRFXCIsXG4gICAgcGF5bG9hZDoge1xuICAgICAga2V5OiBcInNob3BlZURhdGFMZW5ndGhcIixcbiAgICAgIHZhbHVlOiBwYXJzZWREYXRhLmxlbmd0aCxcbiAgICB9LFxuICB9KTtcbn0iXSwibmFtZXMiOlsiemhpeGlhU3RvcmFnZUtleSIsImdldENoaW5hRGF0ZSIsInNob3BlZVN0b3JhZ2VLZXkiLCJTaXRlQ29uZmlnIiwiZ2V0U2l0ZUluZm9CeUhvc3QiLCJob3N0IiwicyIsImdldFByb2R1Y3RVcmwiLCJpdGVtSWQiLCJzaG9wSWQiLCJpdGVtTmFtZSIsInJlcXVlc3QiLCJzZW5kZXIiLCJzZW5kUmVzcG9uc2UiLCJ6aGl4aWFEYXRhTGVuZ3RoIiwic2hvcGVlRGF0YUxlbmd0aCIsInpoaXhpYURhdGEiLCJzaG9wZWVEYXRhIiwicGFyc2VkWmhpeGlhRGF0YSIsInBhcnNlZFNob3BlZURhdGEiLCJjc3ZDb250ZW50IiwiY29udmVydFRvQ1NWIiwiYmxvYiIsImxpbmsiLCJ1cmwiLCJldmVudCIsImV2ZW50RGF0YSIsInNob3BlZUhhbmRsZXIiLCJfYSIsIl9iIiwiZmlyc3RDYXRlZ29yeSIsInNlY29uZENhdGVnb3J5Iiwic2hvcGVlRGF0YU1hcCIsImFjYyIsIml0ZW0iLCJhcnIiLCJmaWVsZE1hcHBpbmciLCJoZWFkZXJzIiwiZiIsInJvd3MiLCJmaWVsZCIsInYiLCJ0aW1lIiwicmVzdWx0RGF0YSIsImhhbmRsZXJzIiwic2hvcGVlR2V0TGlzdCIsInNob3BlZUdldEhkTGlzdCIsImUiLCJsaXN0Iiwia2V5d29yZCIsInNpdGVOYW1lIiwiaW1nQmFzZSIsImRhdGEiLCJpdGVtX2Jhc2ljIiwiaXRlbV9kYXRhIiwiaXRlbV9jYXJkX2Rpc3BsYXllZF9hc3NldCIsInNvbGQiLCJoaXN0b3JpY2FsX3NvbGQiLCJzaG9wX2xvY2F0aW9uIiwiaXRlbWlkIiwicHJpY2UiLCJjdGltZSIsIm5hbWUiLCJpbWFnZSIsInByb2R1Y3RfdXJsIiwiaXRlbV9jYXJkX2Rpc3BsYXlfcHJpY2UiLCJzdG9yZVNob3BlZURhdGEiLCJuZXdEYXRhIiwic3RvcmVkRGF0YSIsInBhcnNlZERhdGEiLCJpdGVtTWFwIl0sIm1hcHBpbmdzIjoiQUFHQSxNQUFNQSxFQUFtQixVQUFVQyxFQUFBLENBQWMsR0FDM0NDLEVBQW1CLFVBQVVELEVBQUEsQ0FBYyxHQUUzQ0UsRUFBYSxDQUNqQixHQUFJLENBQ0YsU0FBVSxLQUNWLEtBQU0scUJBQ04sUUFBUywyQ0FDWCxFQUNBLFNBQVUsQ0FDUixTQUFVLE9BQ1YsS0FBTSxrQkFDTixRQUFTLDJDQUNYLEVBQ0EsVUFBVyxDQUNULFNBQVUsTUFDVixLQUFNLGtCQUNOLFFBQVMsMkNBQ1gsRUFDQSxHQUFJLENBQ0YsU0FBVSxNQUNWLEtBQU0sa0JBQ04sUUFBUywyQ0FDWCxFQUNBLEdBQUksQ0FDRixTQUFVLEtBQ1YsS0FBTSxrQkFDTixRQUFTLDJDQUNYLEVBQ0EsR0FBSSxDQUNGLFNBQVUsS0FDVixLQUFNLGtCQUNOLFFBQVMsMkNBQUEsQ0FFYixFQUdBLFNBQVNDLEVBQWtCQyxFQUFNLENBQ3hCLE9BQUEsT0FBTyxPQUFPRixDQUFVLEVBQUUsS0FBTUcsR0FBTUQsSUFBU0MsRUFBRSxJQUFJLEdBQUssQ0FBQyxDQUNwRSxDQUdBLFNBQVNDLEVBQWMsQ0FBRSxPQUFBQyxF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
