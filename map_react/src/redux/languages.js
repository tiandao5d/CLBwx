// 语言包用于切换全局的语言系统
// 多语言
import zh_cn from '../locale/zh_cn';
import en_us from '../locale/en_us';
import { languageL } from '../utils/storage';
const languageObj = {
    zh_cn,
    en_us
}

const defaultLanguage = languageObj[languageL().language] || zh_cn;
// 方便查看和防止全局字段污染
const acType = typeInit();
const { switchLanguage } = actionInit();
const { languages } = reducerInit();
export { switchLanguage, languages };

// 字符串常量初始化
function typeInit() {
    return {
        ZH_CN: 'ZH_CN',
        EN_US: 'EN_US'
    }
}

// 数据 reducer
function reducerInit() {
    function languages(state = defaultLanguage, action) {
        if ( Object.keys(acType).includes(action.type) ) {
            languageL({
                language: (action.type + '').toLocaleLowerCase()
            });
        }
        switch (action.type) {
            case acType.ZH_CN:
                return zh_cn;
            case acType.EN_US:
                return en_us;
            default:
                return state;
        }
    }
    return { languages };
}

// action
function actionInit() {
    function switchLanguage(locale) {
        locale = locale.toLocaleUpperCase();
        return {
            type: locale
        }
    }
    return { switchLanguage };
}