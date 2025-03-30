// 打开详情页
// - 获取localstorage中detail_product_list字段并反解析
// - 查询第一个sold字段为undefined的product_url并拼接query信息item_id
//   - 若没有则结束
// - 组装product_detail_url `${product_url}?item_id=${item_id}`

import { downloadCSV, jsonListToCsv } from "./utils";

// - 打开window.open(product_detail_url)
const ProductDetailUrlRegex = /^https:\/\/.*\.xiapibuy\.com\/.*-i\..*$/;

export const openNextDetail = () => {
  const detail_product_list = localStorage.getItem("detail_product_list")
  const detailProductList = JSON.parse(detail_product_list || "[]");
  const nextProduct = detailProductList.find(
    (product: any) => product.sold === undefined && ProductDetailUrlRegex.test(product.product_url)
  );
  if (!nextProduct && detailProductList.length) {
    downloadCSV(jsonListToCsv(detailProductList), "detail_product_list")
    return;
  }
  if (nextProduct) {
    const productUrl = nextProduct.product_url;
    const itemId = nextProduct.item_id;
    const productDetailUrl = `${productUrl}?item_id=${itemId}`;
    window.open(productDetailUrl);
  }
};

// 商详页跳店铺页
// - 劫持/api/v4/pdp/get_pc请求，获取店铺名称data.shop_detailed.account.username
// - 替换location.pathname = /${shop_name}会保留query信息进行跳转到店铺页
export const shopeeJumpShop = (resultData: any) => {
  const shop_name = resultData.data.data.shop_detailed.account.username;
  if (!shop_name) {
    return;
  }
  location.pathname = `/${shop_name}`;
}

// 店铺页记录销量
// - 劫持/api/v4/shop/rcmd_items请求，获取所有推荐列表循环获取data.items
// - 从query中获取item_id信息，查找到item详情，提取出sold和history_sold
// - 将数据存储到localstorage的detail_product_list中
export const shopeeGetSoldInfo = (resultData: any) => {
  const items = resultData.data.data.items
  const params = new URLSearchParams(window.location.search);
  const item_id = params.get('item_id')
  if (!item_id) {
    return
  }
  const item = items.find(({itemid}: {itemid: string}) => itemid == item_id)

  const detailProductList = JSON.parse(
    localStorage.getItem("detail_product_list") || "[]"
  );
  detailProductList.forEach((product: any) => {
    if (product.item_id === item_id) {
      if(item){
        const {sold, historical_sold} = item
        product.sold = sold
        product.historical_sold = historical_sold
      }else{
        product.sold = -1
        product.historical_sold = -1
      }
    }
  })
  localStorage.setItem("detail_product_list", JSON.stringify(detailProductList))

  // 打开下一个商品，并关闭上一个标签页
  openNextDetail()
  window.close()
}