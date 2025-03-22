// 获取当天的存储键名
const zhixiaStorageKey = `zhixia_${getChinaDate()}`;
const shopeeStorageKey = `shopee_${getChinaDate()}`;

// content.js 接收popup操作消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FROM_POPUP") {
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
        // 创建下载链接
        const blob = new Blob([csvContent], {
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
  const shopeeDataMap = shopeeData.reduce((acc, item) => {
    acc[item.itemid] = {
      shopeeSold: item.sold,
      shopeeHistoricalSold: item.historical_sold,
      shopeeLocation: item.shop_location,
      realPrice: item.price,
    };
    return acc;
  }, {});
  const arr = zhixiaData.map((item) => {
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
function getChinaDate() {
  return new Date()
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
  const data = list.map(({ item_data }) => {
    const { sold, historical_sold, shop_location, itemid, price } = item_data;
    return {
      sold,
      historical_sold,
      shop_location,
      itemid,
      price,
    };
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
    const { item_data } = item;
    const sold = item_data.item_card_display_sold_count.monthly_sold_count;
    const historical_sold =
      item_data.item_card_display_sold_count.historical_sold_count;
    const shop_location = item_data.shop_data.shop_location;
    const itemid = item_data.item_card_display_price.item_id;
    const price = item_data.item_card_display_price.price;
    return {
      sold,
      historical_sold,
      shop_location,
      itemid,
      price,
    };
  });
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
