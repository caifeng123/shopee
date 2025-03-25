// 在模块初始化阶段劫持
(function () {
  // 保存原始消息发送器
  const originalSender = chrome.runtime.sendMessage;

  // 创建拦截中间件
  const messageProxy = new Proxy(originalSender, {
    apply: function (target, thisArg, argumentsList) {
      const [message, callback] = argumentsList;
      // 重点拦截 item_list 请求
      if (message?.code === "item_list") {
        const hijackedCallback = (...args) => {
          // 调试日志（生产环境需移除）
          console.debug("[SW Intercept] 捕获到 item_list 响应", args[0]);

          const today = new Date()
            .toLocaleDateString("zh-CN", {
              timeZone: "Asia/Shanghai",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\//g, "-"); // 输出格式：yyyy-mm-dd

          const newData = args[0] || [];
          const storageKey = `zhixia_${today}`;
          const storedData =
            JSON.parse(localStorage.getItem(storageKey) || "[]") || [];

          // 创建映射表去重（保留最新数据）
          const itemMap = new Map(
            [...storedData, ...newData].map((item) => [
              item.itemId,
              {
                ...item,
                timestamp: Date.now(), // 更新最后更新时间
              },
            ])
          );

          const list = Array.from(itemMap.values());

          localStorage.setItem(storageKey, JSON.stringify(list));

          chrome.runtime.sendMessage({
            type: "STORAGE_UPDATE",
            payload: {
              key: "zhixiaDataLength",
              value: list.length,
            },
          });
          // 执行原始回调
          return callback?.apply(thisArg, args);
        };

        return Reflect.apply(target, thisArg, [message, hijackedCallback]);
      }

      return Reflect.apply(target, thisArg, argumentsList);
    },
  });

  // 重写运行时方法
  chrome.runtime.sendMessage = messageProxy;
})();