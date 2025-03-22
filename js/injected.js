// 判断是否需要拦截接口获取数据
let isRequest = false;
window.previousUrl = null;

function init () {
    try {
        let scriptList = document.querySelectorAll('script') || [];
        if (isItemDetailPage() && scriptList.length > 0) {
            const hasScript = script => {
                return script.type == 'text/mfe-initial-data' && script.dataset && script.dataset.module == 'cGNtYWxsLXByb2R1Y3RkZXRhaWxzcGFnZQ==';
            }
            let _resultList = Array.from(scriptList).filter(hasScript);
            if (_resultList.length > 0) {
                for (let i = 0; i < scriptList.length; i++) {
                    isRequest = false;
                    const script = scriptList[i];
                    if (hasScript(script)) {
                        let scriptData = JSON.parse(script.innerText || '{}');
                        isRequest = !checkScriptData(scriptData);
                        if (!isRequest) {
                            let messageData = JSON.stringify({
                                code: 'SCRIPT_CODE', 
                                data: scriptData
                            });
                            window.postMessage(messageData, '*');
                        }
                        break;
                    }
                }
            } else {
                isRequest = true;
            }
        } else {
            isRequest = true;
        }
    } catch (err) {
        console.error(err);
    }
}

try {
    init();
    setInterval(() => {
        let currentUrl = window.location.href;
        if (currentUrl !== window.previousUrl) {
            window.previousUrl = currentUrl;
            init();
        }
    }, 150);
    servicePluginDockMarking();
} catch (err) {
    console.error(err);
}


/**
 * 对页面进行接口拦截，从而获得页面接口请求后返回的响应数据
 * @type {{originalFetch: any, myFetch: (function(...[*]): *)}}
 */
try {
    let fetch_interceptor = {
        originalFetch: window.fetch.bind(window),
        myFetch: function (...args) {
            return fetch_interceptor.originalFetch(...args).then((response) => {
                if (response.ok) {
                    let fetchResponse = response.clone();
                    fetchResponse.json().then(function (fetchData) {
                        fetchData.request = args;
                        this.sendDatas(fetchData);
                    }).catch(e => {
                        // e.toString();
                    });
                }
                return response;
            })
        }
    };
    window.fetch = fetch_interceptor.myFetch;

    (function (open) {
        XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
            this.addEventListener('readystatechange', function () {
                if (this.readyState == 4 && this.response) {
                    try {
                        let ajaxData = JSON.parse(this.response);
                        ajaxData.request = {url: url, method: method};
                        sendDatas(ajaxData);
                    } catch (e) {
                        // e.toString();
                    }
                }
            }, false);
            open.call(this, method, url, async, user, pass);
        }
    })(XMLHttpRequest.prototype.open);

} catch (err) {
    console.error(err);
}

function checkScriptData (scriptData) {
    let isResult = (
        scriptData.hasOwnProperty('initialState') 
        && Object.prototype.toString.call(scriptData.initialState) == '[object Object]'
        && Object.keys(scriptData.initialState).length != 0
    );
    if (isResult) {
        let _itemObj = scriptData?.initialState?.item?.items || {};
        const pathParams = getPathParams();
        let itemDetail = _itemObj[pathParams.itemId] || {};
        if (itemDetail.item_id || itemDetail.itemid) {
            let _models = Array.isArray(itemDetail.models) ? itemDetail.models : [];
            let _skuDataTotal = _models.reduce((total, current) => {
                return total + (current.price || 0) + (current.sold || 0) + (current.stock || 0);
            }, 0);
            isResult = _skuDataTotal > 0;
        } else {
            isResult = false;
        }
    }
    return isResult;
}

function getPathParams () {
    let resultList = [];
    let _href = window.location.href || '';
    if (_href.indexOf('-i') > -1) {
        resultList = _href.match(/https?:\/\/.*\-i\.([0-9]+)\.([0-9]+).*?/);
    }
    else if (_href.indexOf('shopid=') > -1 && _href.indexOf('itemid=') > -1) {
        let queryParamsStr = _href.split('?')[1];
        if (queryParamsStr) {
            resultList.push(_href);
            queryParamsStr.split('&').forEach(item => {
                let keyValueList = !!item ? item.split('=') : [];
                if (keyValueList[0] == 'shopid') {
                    resultList.push(keyValueList[1]);
                } 
                else if (keyValueList[0] == 'itemid') {
                    resultList.push(keyValueList[1]);
                }
            });
        }
    }
    else if (_href.indexOf('/product/') > -1) {
        resultList = _href.match(/https?:\/\/.*\/product\/([0-9]+)\/([0-9]+)/);
    }
    let pathParams = {
        shopId: resultList[1] || null,
        itemId: resultList[2] || null
    }
    return pathParams;
}

function isItemDetailPage () {
    const pathParams = getPathParams();
    return pathParams.shopId != null && pathParams.itemId != null;
}

function sendDatas(data) {
    // if (isRequest) {
        let messageData = JSON.stringify({
            code: 'REQUEST_CODE', 
            data: data
        });
        window.postMessage(messageData, '*');
    // }
}

function servicePluginDockMarking () {
    try {
        // 注册插件内容
        const registerPlugin = () => {
            window.dispatchEvent(
                new CustomEvent('service-plugin-dock-event', {
                    detail: {
                        type: 'register',
                        name: 'zhixia' // 这里传入插件的名称，需要和url上的kj_agent_plugin后面的名称相同，只能为字母
                    }
                })
            )
        }
        
        // 注册功能初始化判断
        if (window._ServicePluginDockInit) {
            registerPlugin();
        } else {
            window.addEventListener(
                'service-plugin-dock-event-init', 
                e => registerPlugin(),
                false
            );
        }
    } catch (err) {
        console.error(err);
    }
}




