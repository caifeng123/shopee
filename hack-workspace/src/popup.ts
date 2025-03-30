// @ts-nocheck 迁移中，后续再打开
// 增加 DOM 加载完成检测
document.addEventListener("DOMContentLoaded", () => {
  // 使用 insertAdjacentHTML 在 app 元素前插入
  document.getElementById("app").insertAdjacentHTML(
    "beforebegin",
    `
  <div style="display: grid; place-items: center;">
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: center;width: 100%;">
      <button id="clear">清空</button>
      <div style="text-align: center;">
        <div>知虾记录<span id="zhixiaCount">0</span>条</div>
        <div>shopee记录<span id="shopeeCount">0</span>条</div>
      </div>
      <button id="download_search">下载</button>
    </div>
    <div>-----------------------------------------------</div>
    <div>
      <button id="script">start</button>
    </div>
  </div>
`
  );

  // popup.html hack 添加清空、下载按钮、查看数据信息
  const clearButton = document.getElementById("clear");
  const zhixiaCountSpan = document.getElementById("zhixiaCount");
  const shopeeCountSpan = document.getElementById("shopeeCount");
  const downloadSearchButton = document.getElementById("download_search");
  const scriptButton = document.getElementById("script");

  // 知虾数据实时更新监听
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "STORAGE_UPDATE") {
      if (payload.key === 'zhixiaDataLength') {
        zhixiaCountSpan.textContent = request.payload.value;
      }
      if (payload.key === 'shopeeDataLength') {
        shopeeCountSpan.textContent = request.payload.value;
      }
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        type: "FROM_POPUP",
        payload: {
          action: "get_count",
          classes: "search_download"
        },
      },
      (response) => {
        // 更新计数显示
        zhixiaCountSpan.textContent = response.payload.zhixiaDataLength;
        shopeeCountSpan.textContent = response.payload.shopeeDataLength;
      }
    );
  });

  // 清空按钮点击事件
  clearButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          type: "FROM_POPUP",
          payload: {
            action: "clear",
            classes: "search_download"
          },
        },
        (response) => {
          // 更新计数显示
          zhixiaCountSpan.textContent = response.payload.zhixiaDataLength;
          shopeeCountSpan.textContent = response.payload.shopeeDataLength;
        }
      );
    });
  });

  // 下载按钮点击事件
  downloadSearchButton.addEventListener("click", () => {
    // popup.js 发送消息到 content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          type: "FROM_POPUP",
          payload: {
            action: "download_csv",
            classes: "search_download"
          },
        },
        (response) => {
          // 更新计数显示
          zhixiaCountSpan.textContent = response.payload.zhixiaDataLength;
          shopeeCountSpan.textContent = response.payload.shopeeDataLength;
        }
      );
    });
  });

  // 脚本按钮点击事件
  scriptButton.addEventListener("click", () => {
    // popup.js 发送消息到 content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          type: "FROM_POPUP",
          payload: {
            action: scriptButton.textContent,
            classes: "sale_script"
          },
        },
        (response) => {
          scriptButton.textContent = scriptButton.textContent === "start" ? "stop" : "start";
        }
      );
    });
  });
});