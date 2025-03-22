import Vue from 'vue'
import VueI18n from 'vue-i18n'
import elementEnLocale from 'element-ui/lib/locale/lang/en'
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'
import locale from 'element-ui/lib/locale'
import enLocale from './en'
import zhLocale from './zh'
import { getStorageLocal } from "../util/common"
Vue.use(VueI18n)

const messages = {
  en: {
    ...enLocale,
    ...elementEnLocale
  },
  zh: {
    ...zhLocale,
    ...elementZhLocale
  },
}

export async function initI18n() {
  const language = await getStorageLocal('language');
  const i18n = new VueI18n({
      locale: language || process.env.VUE_APP_LANGUAGE, // 如果没有获取到语言，则默认为'zh'
      messages,
  });
  locale.i18n((key, value) => {
      i18n.t(key, value);
  });
  return i18n;
}