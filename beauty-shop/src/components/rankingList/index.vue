<template>
  <div class="page-body">
    <div class="content-body">
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
        </div>
      </div>
      <foot-tabs :value="footActive" :tabarr="tabarr" @change="footTabChange"></foot-tabs>
      <province-list ref="province"></province-list>
    </div>
  </div>
</template>

<script>
import provinceData from '@/assets/json/province.js';

import ProvinceList from '@/components/sharing/province';
import FootTabs from '@/components/sharing/foot';
export default {
  data () {
    const list = []
    for (let i = 0; i < 10; i++) {
      list.push('item' + (i + 1))
    }
    return {
      titletabs: provinceData, // 储存抬头数据
      titleActive: provinceData[0].value, // 储存选中的抬头
      footActive: 'tab1',
      tabarr: [
        {txt: '参选1', val: 'tab1', href: '#/', icon: 'tp'},
        {txt: '参选2', val: 'tab2', href: '#/', icon: 'ss'},
        {txt: '参选3', val: 'tab3', href: '#/', icon: 'phb'},
        {txt: '参选4', val: 'tab4', href: '#/', icon: 'hdsm'}
      ]
    }
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
    },
    //查看更多省份列表
    tabs_more () {
      let that = this;
      that.$refs.province.showCom()
    },
    // tab抬头切换
    titleTabChange ( val ) {
      this.titleActive = val;
    },
    footTabChange ( val ) {
      this.footActive = val;
      if ( val === 'tab2') {
        this.$router.push('/addshop')
      }
    }
  },
  components: {
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
.footer .mu-tab-link-highlight {
  display: none;
}
</style>
