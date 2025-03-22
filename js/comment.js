window.addEventListener('message', function (event) {
   try{
        if (event && event.data && isJSON(event.data)) {
            if (JSON.parse(event.data).code == 'GET_SHOPEE_RATINGS'){
                let params = JSON.parse(event.data).data
                let P = Date.now();
                let myEvent = null
                const I = (Q) => {
                    let K = {
                        RatingsUrl: `https://${location.host}/api/v2/item/get_ratings?limit=${params.limit}&offset=${params.offset}&shopid=${params.shopid}&itemid=${params.itemid}&filter=${params.filter}&type=${params.type}&exclude_filter=1&filter_size=0&flag=1&fold_filter=0&relevant_reviews=false&request_source=2&tag_filter=&variation_filters=`,
                        time: P,
                    }
                    myEvent = new CustomEvent("getProductRatings", { detail: K });
                    document.dispatchEvent(myEvent);
                }
                document.addEventListener("getProductRatings",handleProductRatings)
               
                I()
            } else if(JSON.parse(event.data).code == 'REMOVE_RATINGS_EVENT') {
                document.removeEventListener("getProductRatings", handleProductRatings);
            }
        }
    } catch(e){
        console.log(e)
    }
}, false);

function isJSON (data) {
    if (typeof data === 'string') {
        try {
            let jsonObj = JSON.parse(data);
            return true;
        } catch (e) {
            return false;
        }
    }
    return false;
}


function handleProductRatings(event) {
    window.fetch(event.detail.RatingsUrl)
    .then((t) => t.json())
    .then((t) => {
        let e = new CustomEvent(`productRatingsDetail`, {
            detail: {res: t}
        });
        document.dispatchEvent(e);
        document.removeEventListener('myEvent',this);
    });
}