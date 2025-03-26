export interface SiteConfig {
  siteName: string;
  host: string;
}

export interface SiteConfigs {
  [key: string]: SiteConfig;
}

export interface ProductData {
  itemId?: string;
  itemid?: string;  // shopee API 返回的字段名
  shopId?: string;
  itemName?: string;
  imgUrl?: string;
  catName?: string;
  createTime?: number;
  sold?: number;
  sales?: number;
  sales7Day?: number;
  sales30Day?: number;
  gmv30Day?: number;
  sales30Rate?: number;
  realPrice?: number;
  shopeeSold?: number;
  shopeeHistoricalSold?: number;
  shopeeLocation?: string;
  tranPrice?: string;
  likeCount?: number;
  ratingNum?: number;
  ratingStar?: number;
  product_url?: string;
  price?: number;
  ctime?: number;
  historical_sold?: number;
  shop_location?: string;
  timestamp?: number;
}

export interface MessageResponse {
  type: string;
  payload: {
    zhixiaDataLength?: number;
    shopeeDataLength?: number;
    key?: string;
    value?: number;
    action?: string;
  };
}

export interface ShopeeRequest {
  url: string;
  [key: string]: any;
}

export interface ShopeeEventData {
  code: string;
  data: {
    request: ShopeeRequest[];
    items?: any[];
    data?: {
      units: Array<{
        item: {
          item_data: {
            item_card_display_sold_count: {
              monthly_sold_count: number;
              historical_sold_count: number;
            };
            shop_data: {
              shop_location: string;
            };
            item_card_display_price: {
              item_id: string;
              price: number;
            };
            shopid?: string;
          };
          item_card_displayed_asset?: {
            name: string;
          };
        };
      }>;
    };
  };
}

export interface ShopeeItemBasic {
  sold: number;
  historical_sold: number;
  shop_location: string;
  itemid: string;
  price: number;
  ctime: number;
  name: string;
}

export interface ShopeeItemData {
  itemid: string;
  item_card_display_price: {
    price: number;
  };
  ctime: number;
}

export interface ShopeeItem {
  item_basic?: ShopeeItemBasic;
  item_data?: ShopeeItemData;
  item_card_displayed_asset?: {
    shop_location: string;
    name: string;
  };
} 