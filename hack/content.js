// 获取当天的存储键名
const zhixiaStorageKey = `zhixia_${getChinaDate()}`;
const shopeeStorageKey = `shopee_${getChinaDate()}`;

const siteConfig = {
  TW: {
    siteName: "台湾",
    host: "xiapi.xiapibuy.com",
  },
  MALAYSIA: {
    siteName: "马来西亚",
    host: "my.xiapibuy.com",
  },
  SINGAPORE: {
    siteName: "新加坡",
    host: "sg.xiapibuy.com",
  },
  PH: {
    siteName: "菲律宾",
    host: "ph.xiapibuy.com",
  },
  VN: {
    siteName: "越南",
    host: "vn.xiapibuy.com",
  },
  TH: {
    siteName: "泰国",
    host: "th.xiapibuy.com",
  }
};


// 根据网页 host 获取站点名称 
function getSiteNameByHost(host) {
  const site = Object.values(siteConfig).find((s) => host === s.host);
  return site ? site.siteName : "未知";
}

// 根据获取商品链接
function getProductUrl({
  itemId,
  shopId,
  itemName
}) {
  if (!itemId || !shopId || !itemName) {
    return undefined;
  }

  return `https://${location.href}/${itemName}-i.${shopId}.${itemId}`
}

// content.js 接收popup操作消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FROM_POPUP") {
    let zhixiaDataLength = 0;
    let shopeeDataLength = 0;
    if (request.payload.action === "download_csv") {
      const zhixiaData = localStorage.getItem(zhixiaStorageKey) || "[]";
      const shopeeData = localStorage.getItem(shopeeStorageKey) || "[]";
      debugger

      const parsedZhixiaData = JSON.parse(zhixiaData) || [];
      const parsedShopeeData = JSON.parse(shopeeData) || [];

      if (parsedZhixiaData.length > 0 || parsedShopeeData.length > 0) {
        // 将数据转换为 CSV 格式
        const csvContent = convertToCSV(parsedZhixiaData, parsedShopeeData);
        // 创建下载链接
        const blob = new Blob(["\uFEFF" + csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `${shopeeStorageKey}.csv`);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    }
    if (request.payload.action === "clear") {
      localStorage.removeItem(zhixiaStorageKey);
      localStorage.removeItem(shopeeStorageKey);
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
        // 处理接收到的数据
        if (
          eventData.data &&
          eventData.data.request &&
          eventData.data.request.length
        ) {
          shopeeHandler(eventData.data.request[0], eventData);
        }
        // 这里可以添加你处理数据的逻辑
      }
    } catch (error) {
      console.error("Error parsing message data:", event.data);
    }
  },
  false
);

// 将数组转换为 CSV 格式
function convertToCSV(zhixiaData, shopeeData) {

  const firstCategory = document.querySelector(".shopee-category-list .shopee-category-list__main-category__link")?.innerText || '';
  const secondCategory = document.querySelector(".shopee-category-list .shopee-category-list__sub-category--active")?.innerText || '';

  const shopeeDataMap = shopeeData.reduce((acc, item) => {
    acc[item.itemid] = {
      shopeeSold: item.sold,
      shopeeHistoricalSold: item.historical_sold,
      shopeeLocation: item.shop_location,
      itemName: item.itemName,
      realPrice: item.price,
      createTime: item.ctime,
      product_url: item.product_url,
    };
    return acc;
  }, {});
  const arr = zhixiaData.map((item) => {
    // 优先使用shopee数据
    return {
      ...item,
      ...shopeeDataMap[item.itemId],
    };
  });

  // 定义固定列顺序（根据实际数据结构调整）
  const fieldMapping = [
    ["imgUrl", "图片"],
    ["itemId", "商品ID"],
    ["itemName", "商品名称"],
    ["catName", "类目路径"],
    ["createTime", "上架时间"],
    ["sold", "总销量"],
    ["sales", "近1天销量"],
    ["sales7Day", "近7天销量"],
    ["sales30Day", "近30天销量"],
    ["gmv30Day", "近30天销售额"],
    ["sales30Rate", "近30天销量增长率"],
    ["realPrice", "实际价格(shopee)"],
    ["shopeeSold", "最近30天销量(shopee)"],
    ["shopeeHistoricalSold", "历史销量(shopee)"],
    ["shopeeLocation", "店铺位置(shopee)"],
    ["tranPrice", "价格走势"],
    ["likeCount", "点赞数"],
    ["ratingNum", "评论数"],
    ["ratingStar", "商品评分"],
    ["product_url", "商品链接"],
    ["firstCategory", "一级类目"],
    ["secondCategory", "二级类目"],
    ["siteName", "站点"],
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
          case "firstCategory":
            return firstCategory;
          case "secondCategory":
            return secondCategory;
          case "siteName":
            return getSiteNameByHost(location.host);
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
  const data = list.map((item) => {
    const { item_basic, item_data, item_card_displayed_asset } = item;
    // 直接搜索
    if (item_basic) {
      const {
        sold,
        historical_sold,
        shop_location,
        itemid,
        price,
        ctime,
        name,
      } = item_basic;
      return {
        sold,
        historical_sold,
        shop_location,
        itemid,
        price: price / 100000,
        itemName: name,
        ctime: getChinaDate(ctime * 1000),
      };
    }
    // 推荐-最热销
    if (item_data) {
      const { itemid, item_card_display_price, ctime } = item_data;
      return {
        sold: "-",
        historical_sold: "-",
        shop_location: item_card_displayed_asset.shop_location,
        itemid,
        price: item_card_display_price.price / 100000,
        itemName: item_card_displayed_asset.name,
        ctime: getChinaDate(ctime * 1000),
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
    
    if(!product_url) {
      debugger
    }
    return {
      sold,
      historical_sold,
      shop_location,
      itemid,
      price,
      product_url,
    };
  });
  debugger;
  storeShopeeData(data);
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
