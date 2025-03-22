import {
    searchItemById,
    getItemCatPathByCatId,
    getActivityStatus,
    shopInfo,
    getItemSkuByItemId,
    getRate,
    drainageWordsRanking,
    hotItemList,
    alibabaSearchImg,
    getItemListByToken, 
    getItemCatPathListByCatId,
    plugin30Day,
    itemMonitor,
    itemBatchMonitor,
    getBidSearchVolume,
    getSalesGmvBy30Day,
    getMarketStock,
    getCategoryDistribute,
    getProductTypeDistribute,
    getProductShelfTimeDistribute,
    getProductListByPanel,
    getKeywordMiningByPanel,
    getSightWordsByPanel,
    exportCheck,
    getSameKindBy1688,
    getSameKindExtendInfoBy1688,
    getSameKindByTaobao,
    getSkuListBySales30Day,
    getSkuTrendChartBySales30Day
} from "@/util/api";
import { getStorageLocal } from '@/util/common';
import "./Message"
import md5 from 'js-md5';
import sha1 from 'js-sha1';

// import { registerGetWindowProperty, getWindowProperty } from '@/service/GetWindowsInfoService'

// registerGetWindowProperty(chrome.scripting)

// 后台监听事件消息
// 如果manifest.json未配置 action.default_popup，点击扩展按钮会触发此事件
chrome.action.onClicked.addListener(function (tab) {
    chrome.action.setTitle({tabId: tab.id, title: "You are on tab:" + tab.id});
    chrome.tabs.executeScript(null, {file: "utils.js"}, function () {})    
});



// 后台监听事件消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let codeMap = ['GET_PLUGIN_VERSION', 'GET_ZX_COOKIES', 'LOGIN_OUT_ZX', 'GET_CSFR'];
    if (!message.hasOwnProperty('code') || (message.hasOwnProperty('code') && !codeMap.includes(message.code))) {
        var cookies = [];
        chrome.cookies.getAll({domain: 'shopee.menglar.com', name: "Admin-Token"}, function (cookie1) {
            this.loginFlg = (cookie1 && cookie1[0]);
            cookies = cookie1;
            if (!this.loginFlg) {
                chrome.cookies.getAll({domain: 'shopee.mobduos.com', name: "Admin-Token"}, function (cookie2) {
                    this.loginFlg = (cookie2 && cookie2[0]);
                    cookies = cookie2;
                    if (!this.loginFlg) {
                        if (message.code == 'isLogin'){
                            sendResponse("not");
                        } else if (['item_list', 'get_cookie', 'get_cookie_url'].includes(message.code)) {
                            message['isLogin'] = false
                            handler([], message, sendResponse);
                        } else {
                            message['isLogin'] = false
                            sendResponse(message);
                        }
                    } else {
                        message['isLogin'] = true
                        handler(cookies, message, sendResponse);
                    }
                })
            } else {
                message['isLogin'] = true
                handler(cookies, message, sendResponse);
            }
        })
        return true;
    } else {
        return true;
    }
});

function handler(cookie, message, sendResponse){
    let requestType = message.code;
    if (cookie && cookie[0]) {
        let token = cookie[0].value;
        if (requestType == "search_img") {
            // 检测是否是扩展开启状态
            searchImg(message.data)
        } 
        else if (requestType == "item_list") {
            getItemCatPathListByCatId({
                siteId: message.data.siteId,
                itemData: message.data.infoList
            }, token).then(async response => {
                let _catDataList = response?.payload || [];
                let data = {
                    itemId: message.data.list.join(','), 
                    siteId: message.data.siteId, 
                    page: 1
                }
                let dataStr = JSON.stringify(data);
                let md5Str = md5(dataStr);
                let sign = sha1('shopee' + md5Str + 'shopee')
                let params = {
                    itemId: message.data.list.join(','),
                    siteId: message.data.siteId,
                    page: 1,
                    sign: sign
                }
                let language = await getStorageLocal('language') || 'zh';
                getItemListByToken(params, token).then(res => {
                    let _itemDataList = res?.list || [];
                    if (_itemDataList.length) {
                        for (let i = 0; i < _catDataList.length; i++) {
                            for (let j = 0; j < _itemDataList.length; j++) {
                                if (_catDataList[i].itemId == _itemDataList[j].itemId) {
                                    _itemDataList[j].catName = language == 'zh' ? _catDataList[i].catNameZh : _catDataList[i].catNameEn;
                                    continue;
                                }
                            }
                        }
                        fetchRateData(message.data.siteId, rate => {
                            for (let i of _itemDataList) {
                                if (i.discountPrice != null) {
                                    let minPrice = Number((Number(i.discountPrice.split("-")[0].replaceAll(",", "")) / rate).toFixed(2))
                                    i.tranPrice = "￥" + minPrice;
                                    if (i.discountPrice.split(" ").length > 0) {
                                        let maxPrice = Number((Number(i.discountPrice.split("-")[1].replaceAll(",", "").trim()) / rate).toFixed(2))
                                        i.tranPrice += " ~ ￥" + maxPrice;
                                    }
                                } else {
                                    i.tranPrice = "";
                                }
                            }
                            sendResponse(_itemDataList)
                        });
                    } else {
                        let _initItemList = message.data.list.map(v => ({ itemId: v }));
                        for (let i = 0; i < _catDataList.length; i++) {
                            for (let j = 0; j < _initItemList.length; j++) {
                                if (_catDataList[i].itemId == _initItemList[j].itemId) {
                                    _initItemList[j].catName = language == 'zh' ? _catDataList[i].catNameZh : _catDataList[i].catNameEn;
                                    continue;
                                }
                            }
                        }
                        sendResponse(_initItemList);
                    }
                })
            })
        } 
        else if (requestType == "item_detail") {
            if (message.data) {
                let arr = new Array();
                let pathParams = message.data.pathParams || {};
                let itemDetail = message.data || {};
                if (itemDetail.models) {
                    itemDetail.models.forEach(x => {
                        arr.push({
                            itemid: x.itemid, 
                            name: x.name, 
                            modelid: x.modelid, 
                            price: x.price, 
                            stock: x.stock
                        });
                    });
                }

                let _historicalSold = itemDetail.historical_sold || 0;
                let _catList = itemDetail?.item?.categories || [];
                let _level = _catList.length >= 3 ? 3 : _catList.length;
                let params = {
                    isExistItem: true,
                    token: token,
                    siteId: itemDetail.siteId || null,
                    itemId: itemDetail.itemid || pathParams.itemId,
                    shopId: itemDetail.shopid || pathParams.shopId,
                    jsonData: encodeURI(JSON.stringify(arr)) + "#:" + _historicalSold,
                    localUrl: itemDetail.localUrl || null,
                    catId: _catList[_level - 1]?.catid || null,
                    // 最多支持第3级
                    level: _level
                }
                fetchData(params, sendResponse, message);
            }
        }
        else if (requestType == "pc_item_detail") {
            if (message.data) {
                let arr = new Array();
                let pathParams = message.data.pathParams || {};
                let itemDetail = message.data.item || {};
                if (itemDetail.models) {
                    itemDetail.models.forEach(x => {
                        arr.push({
                            itemid: x.item_id, 
                            name: x.name, 
                            modelid: x.model_id, 
                            price: x.price, 
                            stock: x.stock
                        });
                    });
                }

                let _historicalSold = message?.data?.product_review?.historical_sold || 0;
                let _catList = itemDetail.categories || [];
                let _level = _catList.length >= 3 ? 3 : _catList.length;
                let params = {
                    isExistItem: true,
                    token: token,
                    siteId: message.data.siteId || null,
                    itemId: itemDetail.item_id || pathParams.itemId,
                    shopId: itemDetail.shop_id || pathParams.shopId,
                    jsonData: encodeURI(JSON.stringify(arr)) + "#:" + _historicalSold,
                    localUrl: message.data.localUrl || null,
                    catId: _catList[_level - 1]?.catid || null,
                    // 最多支持第3级
                    level: _level
                }
                if (itemDetail.models && itemDetail.models.length) {
                    params['other'] = {
                        dataSource: 'SHOPEE_API',
                        skuList: itemDetail.models || [],
                        itemName: itemDetail.title || ''
                    }
                }
                fetchData(params, sendResponse, message);
            }
        }
        else if (requestType == "more_item_detail") {
            if (message.data) {
                let shopeeDataList = message.data.items || [];
                let pathParams = message.data.pathParams || {};
                let itemDetail = shopeeDataList.find(v => v.itemid == pathParams.itemId) || {};
                if (itemDetail.itemid) {
                    let arr = new Array();
                    if (itemDetail.models) {
                        itemDetail.models.forEach(x => {
                            arr.push({
                                itemid: x.itemid, 
                                name: x.name, 
                                modelid: x.modelid, 
                                price: x.price, 
                                stock: x.stock
                            });
                        });
                    }
            
                    let _historicalSold = itemDetail.historical_sold || 0;
                    let params = {
                        // 在shopee接口数据中能找到符合的商品
                        isExistItem: true,
                        token: token,
                        siteId: message.data.siteId || null,
                        itemId: itemDetail.itemid || message.data.anchor_item_id || pathParams.itemId,
                        shopId: itemDetail.shopid || message.data.shopid || pathParams.shopId,
                        jsonData: encodeURI(JSON.stringify(arr)) + "#:" + _historicalSold,
                        localUrl: message.data.localUrl || null
                    }
                    fetchData(params, sendResponse, message);
                }
                else {
                    let params = {
                        // 在shopee接口数据中未找到符合的商品
                        isExistItem: false,
                        token: token,
                        siteId: message.data.siteId || null,
                        itemId: pathParams.itemId,
                        shopId: pathParams.shopId,
                        jsonData: null,
                        localUrl: message.data.localUrl || null
                    }
                    fetchData(params, sendResponse, message);
                }
            }
        }
        else if (requestType == "script_item_detail"){
            if (message.data) {
                let arr = new Array();
                let pathParams = message.data.pathParams || {};
                let _itemObj = message.data?.initialState?.item?.items || {};
                let itemDetail = _itemObj[pathParams.itemId] || {};
                if (itemDetail.item_id || itemDetail.itemid) {
                    if (itemDetail.models) {
                        itemDetail.models.forEach(x => {
                            arr.push({
                                itemid: x.item_id, 
                                name: x.name, 
                                modelid: x.model_id, 
                                price: x.price, 
                                stock: x.stock
                            });
                        });
                    }

                    let _historicalSold = _itemObj.historical_sold || 0;
                    let params = {
                        isExistItem: true,
                        token: token,
                        siteId: message.data.siteId || null,
                        itemId: itemDetail.item_id || pathParams.itemId,
                        shopId: itemDetail.shop_id || pathParams.shopId,
                        jsonData: encodeURI(JSON.stringify(arr)) + "#:" + _historicalSold,
                        localUrl: message.data.localUrl || null,
                        other: {
                            dataSource: 'SHOPEE_SCRIPT',
                            skuList: itemDetail.models || [],
                            itemName: itemDetail.title || ''
                        }
                    }
                    fetchData(params, sendResponse, message);
                } 
                else {
                    let params = {
                        isExistItem: false,
                        token: token,
                        siteId: message.data.siteId || null,
                        itemId: pathParams.itemId,
                        shopId: pathParams.shopId,
                        jsonData: null,
                        localUrl: message.data.localUrl || null
                    }
                    fetchData(params, sendResponse, message);
                }
            }
        }
        else if (requestType == "show_es"){
            let data = {
                siteId: message.data.siteId,
                itemId: Number(message.data.itemId),
                type: Number(message.data.queryType)
            }
            let dataStr = JSON.stringify(data);
            let md5Str = md5(dataStr);
            let sign = sha1('shopee' + md5Str + 'shopee')
            let params = {
                itemId: message.data.itemId,
                siteId: message.data.siteId,
                type: message.data.queryType,
                sign: sign
            }
            plugin30Day(params).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == "rate"){
            fetchRateData(message.data, rate => {
                sendResponse(rate);
            });
        }
        else if (requestType == "item_monitor"){
            let params = message.data;
            itemMonitor(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == "item_batch_monitor"){
            let params = message.data;
            itemBatchMonitor(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == 'bid_search_volume') {
            let params = message.data;
            getBidSearchVolume(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == 'sales_gmv_30day') {
            let params = message.data;
            getSalesGmvBy30Day(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == 'market_stock') {
            let params = message.data;
            getMarketStock(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == 'category_distribute') {
            let params = message.data;
            getCategoryDistribute(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == 'product_type_distribute') {
            let params = message.data;
            getProductTypeDistribute(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == 'product_shelf_time_distribute') {
            let params = message.data;
            getProductShelfTimeDistribute(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == 'product_list_panel') {
            let params = message.data;
            getProductListByPanel(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == 'keyword_mining_panel') {
            let params = message.data;
            getKeywordMiningByPanel(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == 'sight_words_panel') {
            let params = message.data;
            getSightWordsByPanel(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == 'export_check') {
            let params = message.data;
            exportCheck(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == '1688_same_kind') {
            let params = message.data;
            getSameKindBy1688(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == '1688_same_kind_extend') {
            let params = message.data;
            getSameKindExtendInfoBy1688(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == 'taobao_same_kind') {
            let params = message.data;
            getSameKindByTaobao(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == 'sku_list') {
            let params = message.data;
            getSkuListBySales30Day(params, token).then(res => {
                sendResponse(res);
            })
        }
        else if (requestType == 'show_sku_trend_chart') {
            let params = message.data;
            getSkuTrendChartBySales30Day(params, token).then(res => {
                sendResponse(res);
            })
        }
    } else {
        if (requestType == "item_list") {
            sendResponse({ code: 'noLoginData', message: message });
        }
    }
    if (requestType == "get_cookie") {
        sendResponse(cookie);
    }
    if (requestType == "get_cookie_url") {
        let _domain = cookie && cookie.length > 0 ? (cookie[0].domain || '') : '';
        let _path = message?.data?.path || '';
        let isExternalLinks = message?.data?.isExternalLinks || false
        if(isExternalLinks){
            sendResponse({ fullPath: _path });
        } else {
            if (_domain) {
                if (_path) {              
                    let _newPath = _path[0] == '/' ? _path.substr(1) : _path;
                    sendResponse({ fullPath: `https://${_domain}/workbench/${_newPath}` });
                } else {
                    sendResponse({ fullPath: '' });
                }
            } else {
                sendResponse({ fullPath: 'https://shopee.menglar.com/workbench/login?source=plugin' });
            }
        }
        
    }
}

function fetchRateData(siteId, callback) {
    // -1：转美元，0：转人民币
    getRate({ siteId: 0 }).then(rateRes => {
        let rateList = rateRes.result || [];
        let rateData = rateList.find(v => v.siteId == String(siteId)) || {};
        let rate = rateData.rate || 1;
        callback && callback(rate);
    });
}

function fetchData(params, sendResponse, message) {
    fetchRateData(params['siteId'], rate => {
        searchItemById({
            siteId: params['siteId'], 
            itemId: params['itemId']
        }, params['token']).then(res => {
            if (res.code == 401) {
                message['isLogin'] = false;
                sendResponse(message);
                return true;
            }
            res.isExistItem = params['isExistItem'];
            res.rate = rate;  
            getItemCatPathByCatId({
                siteId: params['siteId'], 
                itemId: params['itemId'],
                catId: params['catId']
            }, params['token']).then(async response => {
                let _catData = response?.payload || {};
                let language = await getStorageLocal('language') || 'zh';
                res.zxCatPath = language == 'zh'? _catData.catNameZh : _catData.catNameEn;
                if (res.itemListInfo.length == 0) {
                    sendResponse(res);
                    return true;
                }
                getActivityStatus({
                    siteId: params['siteId'],
                    itemId: params['itemId']
                }, params['token']).then(res2 => {
                    res.itemListInfo[0].activityStatus = res2.message === '[]' ? 0 : 1;
                    shopInfo({
                        siteId: params['siteId'], 
                        shopId: params['shopId']
                    }, params['token']).then(res3 => {
                        res.itemListInfo[0].shop = res3.data || {};
                        getItemSkuByItemId({
                            shopId: params['shopId'],
                            itemId: params['itemId'],
                            siteId: params['siteId'],
                            data: params['jsonData'],
                            url: params['localUrl']
                        }).then(res4 => {
                            res.itemListInfo[0].skuList = getSkuList({ params, rate, res4 });
                            drainageWordsRanking({
                                siteId: params['siteId'],
                                itemId: params['itemId']
                            }, params['token']).then(res5 => {
                                let word = res5?.payload[0]?.word || [];
                                res.itemListInfo[0].adsWordList = word.filter(x => x.value.some(c => c.toString().includes("::1")));
                                res.itemListInfo[0].wordList = word.filter(x => !x.value.some(c => c.toString().includes("::1")));
                                let _catId = params.hasOwnProperty('catId') ? params['catId'] : res?.itemListInfo[0]?.catId;
                                let _level = 0;
                                if (params.hasOwnProperty('level')) {
                                    _level = params['level'];
                                } else {
                                    let _catPath = res.itemListInfo.length ? res.itemListInfo[0].catNameZh : '';
                                    let _catList = _catPath ? _catPath.split('>') : [];
                                    // 最多支持第3级
                                    _level = _catList.length >= 3 ? 3 : _catList.length;
                                }
                                hotItemList({
                                    catId: _catId || null,
                                    level: _level,
                                    exampleType: 'MONTH',
                                    siteId: params['siteId'],
                                    pageNum: 1,
                                    pageSize: 50,
                                    shopLocation: 0,
                                    isBorder: 0,
                                    shopType: 0,
                                    isFilter: true
                                }, params['token']).then(res6 => {
                                    res.itemListInfo[0].hotItemList = res6.itemListInfo ? res6.itemListInfo.slice(0, 50) : [];
                                    sendResponse(res);
                                })
                            })
                        })
                    })
                })
            })
        })
    });
}
let skuData = []
function getSkuList({ params, rate, res4 }) {
    let _skuList = [];
    let { dataSource, skuList, itemName } = params.other || {};
    if(skuList && skuList.length){
        skuData = skuList
    }
    // if ((dataSource == 'SHOPEE_API' && skuData.length) || (dataSource == 'SHOPEE_SCRIPT' && !skuData.length)) {
    if (dataSource == 'SHOPEE_API') {
        let _dataList = skuList || [];
       
        let _skuSalesTotal = _dataList.reduce((total, current) => {
            return total + (current.sold || 0);
        }, 0);
        _dataList.forEach(v => {
            const _price = (v.price || 0) / 100000;
            const _sales = v.sold || 0;
            _skuList.push({
                skuName: _dataList.length == 1 && !v.name ? itemName : v.name,
                rmbData: {
                    skuPrice: _price / rate,
                    skuTotalGmv: (_price / rate) * _sales
                },
                localData: {
                    skuPrice: _price,
                    skuTotalGmv: _price * _sales,
                },
                skuSales: _sales,
                skuSalesRatio: _skuSalesTotal != 0 ? (_sales / _skuSalesTotal) * 100 : 0,
                skuStock: v.stock || 0
            });
        });
    } 
    else {
        let _dataList = res4.itemSkuDataStatis || [];
        let _skuSalesTotal = _dataList.reduce((total, current) => {
            return total + (current.sales || 0);
        }, 0);
        _dataList.forEach(v => {
            const _sales = v.sales || 0;
            if (v.modelName) {
                _skuList.push({
                    skuName: v.modelName,
                    rmbData: {
                        skuPrice: v.averagePrice,
                        skuTotalGmv: v.averagePrice * _sales
                    },
                    localData: {
                        skuPrice: v.averagePrice * res4.rate,
                        skuTotalGmv: (v.averagePrice * res4.rate) * _sales
                    },
                    skuSales: _sales,
                    skuSalesRatio: _skuSalesTotal != 0 ? (_sales / _skuSalesTotal) * 100 : 0,
                    skuStock: v.stock
                }); 
            }   
        });
    }
    return _skuList;
}

// 搜图
function searchImg(url) {
    alibabaSearchImg({path: url}).then(res => {
        chrome.tabs.create({
            "url": res.body,
            "selected": true
        });
    })
}

function getToken(){
    chrome.cookies.getAll({domain: 'shopee.mobduos.com', name: "Admin-Token"}, function (cookie) {
        this.loginFlg = (cookie && cookie[0])
        if (!this.loginFlg) {
            chrome.cookies.getAll({domain: 'shopee.menglar.com', name: "Admin-Token"}, function (cookie2) {
                this.loginFlg = (cookie2 && cookie2[0])
                if (!this.loginFlg) {
                    chrome.cookies.getAll({domain: 'shopee.menglar.net', name: "Admin-Token"}, function (cookie3) {
                        this.loginFlg = (cookie3 && cookie3[0])
                        if (!this.loginFlg) {
                            return "not"
                        }
                    })
                }
            })
        }
    })
    return "ok";
}

// // 插件安装监听事件
// chrome.runtime.onInstalled.addListener(() => {
//
//     // 清除插件所有的本地数据
//     chrome.storage.local.clear();
//
//     // 设置初始数据
//     chrome.storage.local.set({
//         "demo": "demo 数据",
//         "env": "dev"
//     }, function () {
//         console.log("chrome extension is install.");
//     });
// });
let matches = [
    "xiapibuy.com",
    "shopee.tw",
    "shopee.com.my",
    "shopee.co.id",
    "shopee.co.th",
    "shopee.ph",
    "shopee.sg",
    "shopee.vn",
    "shopee.com.br",
    "shopee.com.mx",
]

chrome.tabs.onUpdated.addListener(async function(tabId,changeInfo,tab){
   
    let urlExists = matches.some(url => tab.url.includes(url))
    if(urlExists && getUrlQuery(tab.url).hasOwnProperty('page') && getUrlQuery(tab.url).page == 0){
        const regex = /(?:&?)page=0/;
        const updatedUrl = tab.url.replace(regex, '');
        chrome.tabs.update(tabId, {
    		'url': updatedUrl,
    		// 'selected': true
    	});
    }



    // if(changeInfo && changeInfo.status && changeInfo.status == "complete"){
    //     console.log('onUpdated_2',changeInfo)
    //     chrome.scripting.executeScript({
    //         args: ['dataLayer'],
    //         target: { tabId: tabId },
    //         world: "MAIN",
    //         func: (propertyPath) => {
    //             return window[propertyPath]
    //         }
    //     }).then((res) => {
    //         console.log('onUpdated_3',res,Array.isArray(res[0].result),getUrlQuery(tab.pendingUrl))
    //         if(res && res.length){
    //             res[0].result.map(item=>{
                
    //                 if(item.info && item.info.targetType && item.info.targetType == 'MainCategoryPage.SearchFilter'){
    //                     console.log('onUpdated_4',item)
    //                     let impressions = item.info.impressions || []
    //                     if(impressions && impressions.length){
    //                         let targetData = impressions[0].targetData
    //                         let pages = getUrlQuery(tab.url) && getUrlQuery(tab.url).page ? getUrlQuery(tab.url).page : null;
    //                         if(targetData && targetData.searchParams && targetData.searchParams.page == pages){
                               
    //                             let searchResult = targetData.uiState.searchResult
    //                             console.log('onUpdated_5',searchResult, targetData.uiState.searchParams)
    //                             // var messageData = JSON.stringify({code: 'pageTurningHdList', data: data});
    //                             // window.postMessage(messageData, '*')
    //                         }
    //                     }
    //                 }
    //             })
    //         }
    //     });
    // }

    if(changeInfo && changeInfo.status && changeInfo.status == "complete" && tab.url.includes('find_similar_products')){
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs.length > 0) {
              const activeTab = tabs[0];
              try {
                  chrome.tabs.sendMessage(activeTab.id, {code:'find_similar_products',url:tabs[0].url}, function (res) { 
                  });
              } catch (error) {
                  console.error(error.message);
              }
            }
          });

    }
})

function getUrlQuery(href){
    var index = href.indexOf('?')
    var query = href.substr(index)
    var theRequest = new Object();
    if (query.indexOf("?") != -1) {
        var str = query.substr(1);
        var strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}
