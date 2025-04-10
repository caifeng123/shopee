// @ts-nocheck 迁移，后续再打开
import {shopeeJumpShop, openNextDetail, shopeeGetSoldInfo, checkShopeePageNotFound, handleScriptPageError,shopeeGetShopBaseError} from './content/detail'
import {downloadCSV} from './content/utils'
// 获取当天的存储键名
const zhixiaStorageKey = `zhixia_${getChinaDate()}`;
const shopeeStorageKey = `shopee_${getChinaDate()}`;

checkShopeePageNotFound()

const SiteConfig = {
  TW: {
    siteName: "台湾",
    host: "xiapi.xiapibuy.com",
    imgBase: "https://down-tw.img.susercontent.com/file",
  },
  MALAYSIA: {
    siteName: "马来西亚",
    host: "my.xiapibuy.com",
    imgBase: "https://down-my.img.susercontent.com/file",
  },
  SINGAPORE: {
    siteName: "新加坡",
    host: "sg.xiapibuy.com",
    imgBase: "https://down-sg.img.susercontent.com/file",
  },
  PH: {
    siteName: "菲律宾",
    host: "ph.xiapibuy.com",
    imgBase: "https://down-ph.img.susercontent.com/file",
  },
  VN: {
    siteName: "越南",
    host: "vn.xiapibuy.com",
    imgBase: "https://down-vn.img.susercontent.com/file",
  },
  TH: {
    siteName: "泰国",
    host: "th.xiapibuy.com",
    imgBase: "https://down-th.img.susercontent.com/file",
  },
};

// 根据网页 host 获取站点名称
function getSiteInfoByHost(host) {
  return Object.values(SiteConfig).find((s) => host === s.host) || {};
}

// 根据获取商品链接
function getProductUrl({ itemId, shopId, itemName }) {
  if (!itemId || !shopId || !itemName) {
    return undefined;
  }

  return `https://${location.host}/${itemName}-i.${shopId}.${itemId}`;
}

// content.js 接收popup操作消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FROM_POPUP") {
    // 搜索+批量下载数据信息
    if (request.payload.classes === "search_download") {
      let zhixiaDataLength = 0;
      let shopeeDataLength = 0;
      if (request.payload.action === "download_csv") {
        const zhixiaData = localStorage.getItem(zhixiaStorageKey) || "[]";
        const shopeeData = localStorage.getItem(shopeeStorageKey) || "[]";
  
        const parsedZhixiaData = JSON.parse(zhixiaData) || [];
        const parsedShopeeData = JSON.parse(shopeeData) || [];
  
        if (parsedZhixiaData.length > 0 || parsedShopeeData.length > 0) {
          // 将数据转换为 CSV 格式
          const csvContent = convertToCSV(parsedZhixiaData, parsedShopeeData);
          downloadCSV(csvContent, shopeeStorageKey);
        }
      }
      if (request.payload.action === "clear") {
        // 清空所有zhixia_和shopee_开头的存储
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('zhixia_') || key.startsWith('shopee_')) {
            localStorage.removeItem(key);
          }
        });
        zhixiaDataLength = 0;
        shopeeDataLength = 0;
      }
      if (request.payload.action === "get_count") {
        const zhixiaData = localStorage.getItem(zhixiaStorageKey);
        if (zhixiaData) {
          const parsedData = JSON.parse(zhixiaData) || [];
          zhixiaDataLength = parsedData.length;
        } else {
          zhixiaDataLength = 0;
        }
        const shopeeData = localStorage.getItem(shopeeStorageKey);
        if (shopeeData) {
          const parsedData = JSON.parse(shopeeData) || [];
          shopeeDataLength = parsedData.length;
        } else {
          shopeeDataLength = 0;
        }
      }
      sendResponse({
        type: "FROM_CONTENT",
        payload: {
          zhixiaDataLength,
          shopeeDataLength,
        },
      });
    }
    // 销量脚本
    if (request.payload.classes === "sale_script") {
      if (request.payload.action === "start") {
        // 开始执行脚本
        openNextDetail();
      }
      if (request.payload.action === "stop") {
        // 停止执行脚本
      }
      
    }
  }
  return true; // 保持长连接
});

// 劫持shopee请求
window.addEventListener(
  "message",
  function (event) {
    // 确保消息来源是当前窗口
    try {
      // 解析接收到的消息数据
      const eventData = JSON.parse(event.data);

      if (eventData.code === "REQUEST_CODE") {
        if (
          eventData.data &&
          eventData.data.request &&
          eventData.data.request.length
        ) {
          shopeeHandler(eventData.data.request[0], eventData);
        }
        // 处理404页面
        if(Object.keys(eventData.data).some(key => key.includes('404'))){
          handleScriptPageError()
        }
      }
    } catch (error) {
      console.error("Error parsing message data:", event.data);
    }
  },
  false
);

// 将数组转换为 CSV 格式
function convertToCSV(zhixiaData, shopeeData) {
  const firstCategory =
    document.querySelector(
      ".shopee-category-list .shopee-category-list__main-category__link"
    )?.innerText || "";
  const secondCategory =
    document.querySelector(
      ".shopee-category-list .shopee-category-list__sub-category--active"
    )?.innerText || "";

  const shopeeDataMap = shopeeData.reduce((acc, item) => {
    acc[item.itemid] = item;
    return acc;
  }, {});
  const arr = zhixiaData.map((item) => {
    // 优先使用shopee数据
    return {
      ...item,
      ...shopeeDataMap[item.itemId],
      firstCategory,
      secondCategory,
    };
  });

  // 定义固定列顺序（根据实际数据结构调整）
  const fieldMapping = [
    ["imgUrl", "图片"],
    ["itemId", "商品ID"],
    ["product_url", "商品链接/名称"],
    ["catName", "类目路径"],
    ["ctime", "上架时间"],
    ["sold", "总销量"],
    ["sales", "近1天销量"],
    ["sales7Day", "近7天销量"],
    ["sales30Day", "近30天销量"],
    ["gmv30Day", "近30天销售额"],
    ["sales30Rate", "近30天销量增长率"],
    ["price", "实际价格(shopee)"],
    ["shopeeSold", "最近30天销量(shopee)"],
    ["shopeeHistoricalSold", "历史销量(shopee)"],
    ["shopeeLocation", "店铺位置(shopee)"],
    ["tranPrice", "价格走势"],
    ["likeCount", "点赞数"],
    ["ratingNum", "评论数"],
    ["ratingStar", "商品评分"],
    ["firstCategory", "一级类目"],
    ["keyword", "关键词"],
    ["siteName", "站点"],
    ["secondCategory", "二级类目"],
    ["type", "信息来源"]
  ];
  const headers = fieldMapping.map((f) => f[1]);
  // 创建 CSV 内容
  const rows = arr.map((item) => {
    return fieldMapping
      .map(([field]) => {
        // 特殊字段处理
        switch (field) {
          case "tranPrice":
            return item[field]?.replace(/[￥~]/g, "") || "";
          case "sales30Rate":
            return `${item[field]}%`;
          case "product_url":
            return item.product_url || item.itemName;
          default:
            return item[field] ?? "";
        }
      })
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

// 获取当前中国日期
function getChinaDate(time = Date.now()) {
  return new Date(time)
    .toLocaleDateString("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-"); // 输出格式：yyyy-mm-dd
}

/**
 * 网关分发
 * @param url
 * @param resultData
 */
function shopeeHandler(url, resultData) {
  let rules = [
    {
      rule: /^.*\/api\/v[0-9].*?\/shop\/get_shop_base/,
      handler: shopeeGetShopBaseError,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/shop\/rcmd_items/,
      handler: shopeeGetSoldInfo,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/pdp\/get_pc/,
      handler: shopeeJumpShop,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/shop\/rcmd_items/,
      handler: shopeeGetShopRcmdList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search\/search_items/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=shop.*?/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=relevancy.*?page_type=search.*?&scenario=.*?/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=ctime.*?page_type=.*?&scenario=PAGE_GLOBAL_SEARCH.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=ctime.*?page_type=.*?&scenario=PAGE_OTHERS.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=sales.*&limit=30|60.*?page_type=.*?&scenario=PAGE_GLOBAL_SEARCH.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=sales.*&limit=30|60.*?page_type=.*?&scenario=PAGE_OTHERS.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=price.*?page_type=.*?&scenario=.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=search.*?&scenario=PAGE_GLOBAL_SEARCH.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=search.*?&scenario=PAGE_CATEGORY.*?/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=ctime.*?page_type=search.*?&scenario=PAGE_CATEGORY.*?/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=sales.*?page_type=search.*?&scenario=PAGE_CATEGORY.*?/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=ctime.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=sales.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=price.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=relevancy.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=relevancy.*?page_type=search.*?&scenario=PAGE_CATEGORY.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=price.*?page_type=search.*?&scenario=PAGE_CATEGORY.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=collection.*?&scenario=PAGE_GLOBAL_SEARCH.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=relevancy.*?page_type=collection.*?&scenario=PAGE_GLOBAL_SEARCH.*/,
      handler: shopeeGetList,
    },
    {
      rule: /^.*\/api\/v[0-9].*?\/recommend\/recommend_v2/,
      handler: shopeeGetHdList,
    },
    // {
    //     rule: /^.*\/api\/v[0-9].*?\/rcmd_items(\/)?\?bundle=.*&limit=.*&offset=.*&shop_id=.*&sort_type=.*&upstream=.*/,
    //     handler: getShopItemList
    // },
    // {
    //     rule: /^.*\/api\/v[0-9].*?\/shop\/rcmd_items.*/,
    //     handler: getShopItemList
    // },
    // {
    //     rule: /^.*\/api\/v[0-9].*?\/homepage\/get_daily_discover\?bundle=.*&item_card=.*&limit=.*&need_tab=.*&offset=.*&view_session_id=.*/,
    //     handler: getHomeItemList
    // },
    // {
    //     rule: /^.*\/api\/v[0-9].*?\/recommend\/product_detail_page.*/,
    //     handler: getSimilarItemList
    // },
    // {
    //     rule: /^.*\/api\/v[0-9].*?\/recommend\/recommend_post.*/,
    //     handler: getFindSimilarProducts
    // }
  ];
  var handlers = rules.filter(function (v) {
    return v.rule.test(url);
  });
  try {
    handlers[0].handler(resultData);
  } catch (e) {
    e.toString();
  }
}

// 获取搜索数据
function shopeeGetList(resultData) {
  const list = resultData.data.items;
  if (list.length == 0) {
    return;
  }
  // 获取当前页面上的关键词
  const keyword =
    document.querySelector(".shopee-searchbar-input input")?.value || "";

  const siteName = getSiteInfoByHost(location.host).siteName;
  const imgBase = getSiteInfoByHost(location.host).imgBase;

  const data = list.map((item) => {
    const { item_basic, item_data, item_card_displayed_asset } = item;
    // 搜索
    if (item_basic) {
      const {
        sold,
        historical_sold,
        shop_location,
        itemid,
        price,
        ctime,
        name,
        image
      } = item_basic;

      const product_url = getProductUrl({
        itemId: itemid,
        shopId: item_basic?.shopid,
        itemName: name
      });

      return {
        shopeeSold: sold,
        shopeeHistoricalSold: historical_sold,
        shopeeLocation: shop_location,
        itemid,
        price: price / 100000,
        itemName: name,
        ctime: getChinaDate(ctime * 1000),
        keyword,
        type: "搜索",
        product_url,
        img: `${imgBase}/${image}`,
        siteName,
      };
    }
    // 推荐-最热销
    if (item_data) {
      const { itemid, item_card_display_price, ctime } = item_data;

      const product_url = getProductUrl({
        itemId: itemid,
        shopId: item_data?.shopid,
        itemName: item_card_displayed_asset?.name,
      });

      return {
        shopeeSold: "-",
        shopeeHistoricalSold: "-",
        shopeeLocation: item_card_displayed_asset.shop_location,
        itemid,
        price: item_card_display_price.price / 100000,
        itemName: item_card_displayed_asset.name,
        ctime: getChinaDate(ctime * 1000),
        keyword,
        type: "推荐-最热销",
        product_url,
        img: `${imgBase}/${item_card_displayed_asset.image}`,
        siteName,
      };
    }
  });
  storeShopeeData(data);
}

// 获取推荐数据
function shopeeGetHdList(resultData) {
  const list = resultData.data.data.units;
  if (list.length == 0) {
    return;
  }

  const data = list.map(({ item }) => {

    const { item_data, item_card_displayed_asset } = item;
    const sold = item_data.item_card_display_sold_count.monthly_sold_count;
    const historical_sold =
      item_data.item_card_display_sold_count.historical_sold_count;
    const shop_location = item_data.shop_data.shop_location;
    const itemid = item_data.item_card_display_price.item_id;
    const price = item_data.item_card_display_price.price;
    const product_url = getProductUrl({
      itemId: itemid,
      shopId: item_data?.shopid,
      itemName: item_card_displayed_asset?.name,
    });

    return {
      sold,
      historical_sold,
      shop_location,
      itemid,
      price,
      product_url,
      type: "推荐-综合排名",
    };
  });
  storeShopeeData(data);
}

// 获取店铺推荐数据
function shopeeGetShopRcmdList(resultData) {
  monitorAndAddInfo(resultData.data.data.items)
}

function storeShopeeData(newData) {
  const storedData = localStorage.getItem(shopeeStorageKey);
  let parsedData = [];
  if (storedData) {
    parsedData = JSON.parse(storedData) || [];
  }
  parsedData = [...parsedData, ...newData];
  // 去重
  const itemMap = new Map(parsedData.map((item) => [item.itemid, item]));
  parsedData = Array.from(itemMap.values());
  localStorage.setItem(shopeeStorageKey, JSON.stringify(parsedData));
  chrome.runtime.sendMessage({
    type: "STORAGE_UPDATE",
    payload: {
      key: "shopeeDataLength",
      value: parsedData.length,
    },
  });
}

// 定义定时器监听函数
function monitorAndAddInfo(dataList) {
  if (!dataList || dataList.length === 0) {
      return;
  }
  const interval = 500;
  const maxItems = 60;
  let processedItems = new Set();

  const timer = setInterval(() => {
      const itemCards = document.querySelectorAll('.shop-search-result-view__item');

      itemCards.forEach((itemCard, index) => {
        // 修复1：添加数据存在性检查
        const cardData = dataList[index]; // 修复变量声明
        if (!cardData) return; // 防止数据越界

        if (processedItems.has(itemCard)) return;

        const locationContainer = itemCard.querySelector('.tranPrice');

        if (locationContainer) {
            const {ctime, sold, historical_sold, liked_count} = cardData; // 原始属性名
            const ctimeDate = new Date(ctime * 1000).toLocaleDateString();
            const isNew = ctimeDate.startsWith('2025');

            const additionalInfoContainer = document.createElement('div');
            additionalInfoContainer.style.marginTop = '5px'; // 添加一些间距
            additionalInfoContainer.style.color = isNew?'red':'#757575'; // 设置文字颜色
            additionalInfoContainer.style.fontSize = '12px'; // 设置文字大小
            additionalInfoContainer.classList.add('additional-info'); // 添加一个标识类，方便调试
            if (isNew) {
                additionalInfoContainer.style.fontWeight = 'bold'; // 设置为粗体
                additionalInfoContainer.style.border = '1px solid red'; // 添加边框
            }

            additionalInfoContainer.innerHTML = `
                <div>创建时间: ${ctimeDate}</div>
                <div>最近销量: ${sold}</div>
                <div>历史销量: ${historical_sold}</div> <!-- 修正属性名 -->
                <div>喜欢数: ${liked_count}</div>      <!-- 修正属性名 -->
            `;

            locationContainer.parentNode.appendChild(additionalInfoContainer);
            processedItems.add(itemCard);
        }
      });

      // 修复3：改为根据已处理数量判断
      if (processedItems.size >= maxItems) {
          clearInterval(timer);
          console.log('已处理商品卡数量:', processedItems.size);
      }
  }, interval);
}