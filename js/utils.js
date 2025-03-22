/**
 * 说明：
 *      utils.js文件属于一个工具类
 *      实现了将injected.js脚本注入到页面上， 进行页面接口请求拦截，实现拦截到接口请求后的参数
 * @type {HTMLScriptElement}
 */
var s = document.createElement('script');
s.src = chrome.runtime.getURL('js/injected.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);


var s2 = document.createElement('script');
s2.src = chrome.runtime.getURL('js/detail.js');
s2.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s2);

var s3 = document.createElement('script');
s3.src = chrome.runtime.getURL('js/comment.js');
s3.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s3);

/**
 * 监听injected.js脚本发送的数据 (包含：解析的页面脚本数据、拦截的接口数据)
 */
let _this = this;
window.addEventListener('message', function (event) {
    try {
        if(event && event.data){
            let eventData = Object.prototype.toString.call(event.data) == '[object Object]' ? event.data : JSON.parse(event.data || '{}');
            if (eventData.code == 'SCRIPT_CODE') {
                _this.getScriptItemDetail(eventData);
            }
            else if (eventData.code == 'REQUEST_CODE') {
                // 通过不同接口请求进行参数分发
                if(eventData.data && eventData.data.request && eventData.data.request.length){
                    _this.handler(eventData.data.request[0], eventData);
                }
            }
        } else {
            e.toString();
        }
    } catch (e) {
        e.toString();
    }
}, false);


/**
 * 网关分发
 * @param url
 * @param resultData
 */
function handler(url, resultData) {
    let rules = [
        // {
        //     rule: /^.*\/api\/v[0-9].*?\/item\/get\?itemid=.*&shopid=.*?/,
        //     handler: this.getItemDetail
        // },
        // {
        //     rule: /^.*\/api\/v[0-9].*?\/item\/get\?shopid=.*&itemid=.*?/,
        //     handler: this.getItemDetail
        // },
        {
            rule: /api\/v4\/pdp\/get_pc/,
            handler: this.getPcItemDetail
        },
        // {
        //     rule: /^.*\/api\/v[0-9].*?\/bundle_deal\/items\/\?anchor_item=.*&bundle_deal_id=.*&from_item=.*&limit=.*&need_recommended_items=.*&offset=.*&page_source=.*/,
        //     handler: this.getMoreItemDetail
        // },
        // {
        //     rule: /^.*\/api\/v[0-9].*?\/pdp\/hot_sales\/get\?item_id=.*&limit=.*&offset=.*&shop_id=.*/,
        //     handler: this.getMoreItemDetail
        // },
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=shop.*?/,
            handler: this.getList
        }, 
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=relevancy.*?page_type=search.*?&scenario=.*?/,
            handler: this.getList
        }, 
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=ctime.*?page_type=.*?&scenario=PAGE_GLOBAL_SEARCH.*/,
            handler: this.getList
        }, 
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=ctime.*?page_type=.*?&scenario=PAGE_OTHERS.*/,
            handler: this.getList
        }, 
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=sales.*&limit=30|60.*?page_type=.*?&scenario=PAGE_GLOBAL_SEARCH.*/,
            handler: this.getList
        }, 
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=sales.*&limit=30|60.*?page_type=.*?&scenario=PAGE_OTHERS.*/,
            handler: this.getList
        }, 
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=price.*?page_type=.*?&scenario=.*/,
            handler: this.getList
        }, {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=search.*?&scenario=PAGE_GLOBAL_SEARCH.*/,
            handler: this.getList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=search.*?&scenario=PAGE_CATEGORY.*?/,
            handler: this.getList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=ctime.*?page_type=search.*?&scenario=PAGE_CATEGORY.*?/,
            handler: this.getList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=sales.*?page_type=search.*?&scenario=PAGE_CATEGORY.*?/,
            handler: this.getList
        },{
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,
            handler: this.getList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=ctime.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,
            handler: this.getList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=sales.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,
            handler: this.getList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=price.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,
            handler: this.getList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=relevancy.*?page_type=collection.*?&scenario=PAGE_COLLECTION.*/,
            handler: this.getList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=relevancy.*?page_type=search.*?&scenario=PAGE_CATEGORY.*/,
            handler: this.getList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=price.*?page_type=search.*?&scenario=PAGE_CATEGORY.*/,
            handler: this.getList
        }, 
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=pop.*?page_type=collection.*?&scenario=PAGE_GLOBAL_SEARCH.*/,
            handler: this.getList
        }, 
        {
            rule: /^.*\/api\/v[0-9].*?\/search_items(\/)?\?by=relevancy.*?page_type=collection.*?&scenario=PAGE_GLOBAL_SEARCH.*/,
            handler: this.getList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/recommend\/recommend_v2/,
            handler: this.getHdList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/rcmd_items(\/)?\?bundle=.*&limit=.*&offset=.*&shop_id=.*&sort_type=.*&upstream=.*/,
            handler: this.getShopItemList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/shop\/rcmd_items.*/,
            handler: this.getShopItemList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/homepage\/get_daily_discover\?bundle=.*&item_card=.*&limit=.*&need_tab=.*&offset=.*&view_session_id=.*/,
            handler: this.getHomeItemList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/recommend\/product_detail_page.*/,
            handler: this.getSimilarItemList
        },
        {
            rule: /^.*\/api\/v[0-9].*?\/recommend\/recommend_post.*/,
            handler: this.getFindSimilarProducts
        }
    ];
    var handlers = rules.filter(function (v) {
        return v.rule.test(url)
    });
    try {
        handlers[0].handler(resultData)
    } catch (e) {
        e.toString()
    }
}

// 通知详情页
function getItemDetail(data){
    var messageData = JSON.stringify({code: 'itemDetail', data: data});
    window.postMessage(messageData, '*')
}

function getPcItemDetail(data){
    var messageData = JSON.stringify({code: 'pcItemDetail', data: data});
    window.postMessage(messageData, '*')
}

function getMoreItemDetail(data){
    var messageData = JSON.stringify({code: 'moreItemDetail', data: data});
    window.postMessage(messageData, '*')
}

function getScriptItemDetail(data){
    var messageData = JSON.stringify({code: 'scriptItemDetail', data: data});
    window.postMessage(messageData, '*')
}

// 通知列表页
function getList(data){
    var messageData = JSON.stringify({code: 'itemList', data: data});
    window.postMessage(messageData, '*')
}

function getHdList(data){
    var messageData = JSON.stringify({code: 'hdList', data: data});
    window.postMessage(messageData, '*')
}

function getShopItemList(data){
    var messageData = JSON.stringify({code: 'shopItemList', data: data});
    window.postMessage(messageData, '*')
}

function getHomeItemList(data){
    var messageData = JSON.stringify({code: 'homeItemList', data: data});
    window.postMessage(messageData, '*')
}

function getSimilarItemList(data){
    var messageData = JSON.stringify({code: 'similarItemList', data: data});
    window.postMessage(messageData, '*')
}
function getFindSimilarProducts(data){
    var messageData = JSON.stringify({code: 'findSimilarProducts', data: data});
    window.postMessage(messageData, '*')
}