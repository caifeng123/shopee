import {
    getUserInfo,
    getPluginVersion
} from "@/util/api";




const GET_ZX_COOKIES = (request,sendResponse)=>{
    let cookies = [];
    let loginFlg = false
    chrome.cookies.getAll({domain: 'shopee.menglar.com', name: "Admin-Token"}, function (cookie1) {
        loginFlg = !!(cookie1 && cookie1[0]);
        cookies = cookie1;
        if (!loginFlg) {
            chrome.cookies.getAll({domain: 'shopee.mobduos.com', name: "Admin-Token"}, function (cookie2) {
                loginFlg = !!(cookie2 && cookie2[0]);
                cookies = cookie2;
                if (!loginFlg) {
                    sendResponse({token:'',loginFlg:loginFlg})
                } else {
                    let params ={
                        token:cookies[0].value,
                        loginFlg:loginFlg,
                        zxUrl:'https://shopee.mobduos.com'
                    }
                    getZxUserInfo(params,sendResponse)
                }
            })
        } else {
            let params ={
                token:cookies[0].value,
                loginFlg:loginFlg,
                zxUrl:'https://shopee.menglar.com'
            }
            getZxUserInfo(params,sendResponse)
        }
    })
}

const LOGIN_OUT_ZX = (request,sendResponse)=>{
    chrome.cookies.remove({
        url: "https://shopee.mobduos.com",
        name: "Admin-Token"
    }, function(res1) {
        chrome.cookies.remove({
            url: "https://shopee.menglar.com",
            name: "Admin-Token"
        }, function(res2) {
            sendResponse()
        });
    }); 
}


const GET_PLUGIN_VERSION = (request,sendResponse)=>{
    getPluginVersion().then(res=>{
        sendResponse(res.payload)
    })

}

const GET_CSFR = (request,sendResponse)=>{
    chrome.cookies.getAll({domain: 'ph.xiapibuy.com', name: "csrftoken"}, function (cookie) {
        sendResponse(cookie)
    })

}



const data={
    GET_ZX_COOKIES,
    LOGIN_OUT_ZX,
    GET_PLUGIN_VERSION,
    GET_CSFR,
}


const init=(request, sender, sendResponse)=>{
    if(!request || !request.code || !data[request.code])return 
    data[request.code](request,sendResponse)
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    init(message, sender, sendResponse)
});

function getZxUserInfo(params,sendResponse){
    getUserInfo('',params.token).then(res=>{
        if(res.code == 200){
            let data = res.data
            let userInfo = data.user
            userInfo.policyName = data.policies && data.policies[0] ? data.policies[0].policyName : '-'
            userInfo.expireTime = data.policies && data.policies[0] ? data.policies[0].expireTime.replace("T", " ") : '-'
            sendResponse({token:params.token,loginFlg:true,userInfo:userInfo,zxUrl:params.zxUrl})
        } else {
            sendResponse({value:'',loginFlg:false})
        }
    })
}