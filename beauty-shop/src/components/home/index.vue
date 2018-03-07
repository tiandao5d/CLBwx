<template>
  <div class="page-body">
    <div class="content-body">
      <banner-swiper :list="bannerList"></banner-swiper>
      <div class="tabs-box">
        <div class="tabs-title-box">
          <div class="tabs-title-con">
            <mu-tabs :value="titleActive" @change="titleTabChange" :style="{'width': (titletabs.length * 60) + 'px'}">
              <mu-tab v-for="tab, index in titletabs" :key="index" :value="tab.value" :tabval="tab.value" :title="tab.desc"/>
            </mu-tabs>
          </div>
          <div class="tabs-title-more" @click="tabs_more">
            <mu-icon class="tm-icon" value="expand_more" :size="40"/>
          </div>
        </div>
        <div class="tabs-content">
          <div>{{titleActive}}</div>
          <div class="clearfix plist-ul">
            <product-list v-for="item, index in productlist" :item="item" :key="index"></product-list>
          </div>
          <scroll-bottom :scroller="scroller" :loading="loading" @load="loadMore"></scroll-bottom>
        </div>
      </div>
      <foot-tabs :value="footActive" :tabarr="tabarr" @change="footTabChange"></foot-tabs>
      <province-list ref="province"></province-list>
    </div>
  </div>
</template>

<script>
import BannerSwiper from '@/components/sharing/banner'; // banner
import ProductList from './product_list'; // 商品列表
import ScrollBottom from '@/components/sharing/scrollbottom'; // 滚动到底部加载
import provinceData from '@/assets/json/province.js'; // 省份数据
import ProvinceList from '@/components/sharing/province'; // 省份列表
import FootTabs from '@/components/sharing/foot'; // 底部菜单
export default {
  data () {
    const list = []
    for (let i = 0; i < 10; i++) {
      list.push('item' + (i + 1))
    }
    return {
      num: 10,
      loading: false,
      scroller: null,
      productlist: list,
      bannerList: [], // 储存banner图数据
      titletabs: provinceData, // 储存抬头数据
      titleActive: provinceData[0].value, // 储存选中的抬头
      footActive: 'tab1',
      tabarr: [
        {txt: '参选1', val: 'tab1', href: '#/', icon: 'cxzd'},
        {txt: '参选2', val: 'tab2', href: '#/', icon: 'ss'},
        {txt: '参选3', val: 'tab3', href: '#/', icon: 'wdbm'},
        {txt: '参选4', val: 'tab4', href: '#/', icon: 'hdsm'}
      ]
    }
  },
  mounted () {
    this.scroller = this.$el.querySelector('.tabs-content')
  },
  created () {
    // 页面数据初始化
    this.pageInit()
  },
  watch: {
    titleActive ( nv, ov ) {
      let ele = document.querySelector('[tabval="' + nv + '"]'),
          box = document.querySelector('.tabs-title-con');
      let bw = box.offsetWidth,
          bd = box.scrollWidth,
          el = ele.offsetLeft;
      let maxl = bd - bw,
          l = box.scrollLeft,
          r = l + bw,
          sval = el > maxl ? maxl : el;
      if ( sval < l || sval > r ) {
        box.scrollLeft = sval;
      }
    }
  },
  methods: {
    // 页面数据并发请求
    pageInit () {
      let me = this;
      let pid = me.$xljs.localProL().id || 0;
      me.$xljs.ajaxAll([
        {url: `${me.$xljs.domainUrl}/ushop-api-merchant/api/sns/notify/banner/list/6/${pid}.json`}
      ], function () {
        me.bannerInit(arguments[0]);
      });
    },
    //查看更多省份列表
    tabs_more () {
      let that = this;
      that.$refs.province.showCom()
    },
    // banner图初始化
    bannerInit (obj) {
      let me = this;
      let arr = obj.recordList || [];
      arr = arr.map((o, i) => {
        return o.pictureAddress
      })
      me.bannerList = arr;
    },
    // tab抬头切换
    titleTabChange ( val ) {
      this.titleActive = val;
    },
    footTabChange ( val ) {
      this.footActive = val;
    },
    loadMore () {
      if (this.num >= 20) {
        return false;
      }
      this.loading = true
      setTimeout(() => {
        for (let i = this.num; i < this.num + 10; i++) {
          this.productlist.push('item' + (i + 1))
        }
        this.num += 10
        this.loading = false
      }, 2000)
    }
  },
  components: {
    BannerSwiper,
    ProductList,
    ScrollBottom,
    ProvinceList,
    FootTabs
  }
}
</script>
<style scoped>
.tabs-box {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 79px;
  margin-top: 33.33333%;
}
.tabs-title-box {
  position: relative;
  width: 100%;
  border-top: solid 1px #ddd;
  border-bottom: solid 1px #ddd;
  padding-right: 48px;
}
.tabs-title-con {
  overflow-y: hidden;
  overflow-x: auto;
  margin: 0 auto;
}
.tabs-title-more {
  position: absolute;
  right: 0;
  top: 0;
  width: 48px;
  height: 48px;
  border-left: solid 1px #ddd;
  background-color: #fff;
  z-index: 10;
}
.tm-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.tabs-content {
  position: absolute;
  left: 0;
  top: 50px;
  right: 0;
  bottom: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
.plist-ul {
  padding-top: 5px;
}
.footer .mu-tab-link-highlight {
  display: none;
}
</style>
