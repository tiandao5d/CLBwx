<template>
  <!-- 排行榜界面 -->
  <div class="page-body">
    <div class="content-body">
      <div class="tabs-box">
        <div class="tabs-title-box">
          <div class="tabs-title-con">
            <mu-tabs :value="titleActive" @change="titleTabChange" :style="{'width': (titletabs.length * 60) + 'px'}">
              <mu-tab v-for="tab, index in titletabs" :key="index" :value="tab.val" :tabval="tab.val" :title="tab.txt"/>
            </mu-tabs>
          </div>
          <div class="tabs-title-more" @click="tabs_more">
            <mu-icon class="tm-icon" value="expand_more" :size="40"/>
          </div>
        </div>
        <div class="tabs-content">
          <img class="tabs-bg1" :src="pageBg20">
          <div class="tabs-item" :style="{'backgroundImage': 'url(' + pageBg21 + ')'}">
            <div class="scroll-con rl-table-null" v-if="!(rankData.length > 0)">没有数据</div>
            <div class="scroll-con" v-if="rankData.length > 0">
              <table class="rl-table">
                <thead>
                  <tr><th>名次</th><th>站点</th><th>票数</th></tr>
                </thead>
                <tbody>
                  <tr v-for="item, index in rankData" :key="index">
                    <td>{{index > 8 ? ((index + 1) + '') : ('0' + (1 + index))}}</td><td>{{item.serialNo}}</td><td>{{item.score}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="scroll-con rl-table-fixed" v-if="rankData.length > 0">
              <table class="rl-table">
                <thead>
                  <tr><th>名次</th><th>站点</th><th>票数</th></tr>
                </thead>
                <tbody>
                  <tr v-for="item, index in rankFixed" :key="index">
                    <td>{{index > 8 ? ((index + 1) + '') : ('0' + (1 + index))}}</td><td>{{item.serialNo}}</td><td>{{item.score}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <foot-tabs :value="footActive" :tabarr="tabarr" @change="footTabChange"></foot-tabs>
      <city-list ref="province" :ctarr="titletabs"/>
    </div>
  </div>
</template>

<script>
import pageBg20 from '@/assets/image/bs/add_shop020.png';
import pageBg21 from '@/assets/image/bs/add_shop021.png';

import ctData from '@/assets/json/city.show.js'; // 城市数据
import cityList from '@/components/sharing/cityselect'; // 城市列表组件
import FootTabs from '@/components/sharing/foot';
export default {
  data () {
    const list = []
    for (let i = 0; i < 10; i++) {
      list.push('item' + (i + 1))
    }
    let listParam = {},
        plen = ctData.length;
    for ( let i = 0; i < plen; i++ ) {
      listParam[('p' + ctData[i].val)] = {
        currentPage: 0, // 当前页
        totalCount: 1, // 总个数
        pagePage: 1, // 总页数
        recordList: [], // 数据内容
        ct: ctData[i] // 地区的文字和代号
      };
    }
    return {
      pageBg20,
      pageBg21,
      titletabs: ctData, // 储存抬头数据
      titleActive: ctData[0].val, // 储存选中的抬头
      footActive: 'tab3', // 底部菜单选中项
      rankData: [], // 排行榜列表
      iptErrObj: {
        sderr: ''
      },
      tabarr: [
        {txt: '投票', val: 'tab1', href: '/home', icon: 'tp'},
        {txt: '搜索', val: 'tab2', href: '', icon: 'ss'},
        {txt: '排行榜', val: 'tab3', href: '/rankingList', icon: 'phb'},
        {txt: '我的投票', val: 'tab4', href: '/myVote', icon: 'wdtp'}
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
  computed: {
    rankFixed () {
      return this.rankData.slice(0, 1);
    }
  },
  methods: {
    // 页面数据并发请求
    pageInit () {
      let that = this;
      that.getRankingFn(that.titleActive);
    },
    //查看更多省份列表
    tabs_more () {
      let that = this;
      that.$refs.province.showCom()
    },
    // tab抬头切换
    titleTabChange ( val ) {
      let that = this;
      that.titleActive = val;
      that.getRankingFn(that.titleActive);
    },
    getRankingFn ( district ) {
      let that = this,
          _url = `/ushop-api-merchant/api/sns/vote/candidate/listByTopN/${that.$xljs.bsid}/${district}`;
      // 后台操作，不需要遮屏
      that.$xljs.ajax(_url, 'get', {}, (data) => {
        if ( data.recordList ) {
          if ( data.recordList.length > 0 ) {
            that.rankData = data.recordList
          } else {
            that.$xljs.toast('没有数据！');
          }
        } else {
          that.$xljs.toast((data.error_description || '未知错误'));
        }
      });
    },
    footTabChange ( val ) {
      let that = this,
          item;
      that.footActive = val;
      if ( val === 'tab2' ) { // 搜索
        that.$router.push({
          name: 'Home',
          params: {searchtrue: true}
        });
        return false;
      }
      that.$xljs.each(that.tabarr, (index, obj) => {
        if ( obj.val === val ) {
          item = obj;
          return false;
        }
      });
      that.$router.push(item.href);
    }
  },
  components: {
    cityList,
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
  background-color: #fffad3;
  -webkit-overflow-scrolling: touch;
}
.tabs-bg1 {
  width: 100%;
}
.tabs-item {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin-top: 22.93125%;
  background-repeat: repeat-y;
  background-size: 100%;
}
.scroll-con {
  position: absolute;
  left: 9.5%;
  right: 9.5%;
  top: 0;
  bottom: 12px;
  overflow-y: auto;
  overflow-x: hidden;
}
.rl-table-fixed {
  position: absolute;
  left: 9.5%;
  right: 9.5%;
  top: 0;
  height: 30px;
  overflow: hidden;
}
.rl-table-null {
  background: #fffad3;
  color: #555;
  font-size: 17px;
  text-align: center;
  line-height: 2;
}
.rl-table {
  background-color: #fffad3;
  border-collapse:collapse;
  width: 100%;
}
.rl-table th,
.rl-table td {
  text-align: center;
  vertical-align: middle;
  border: solid 1px #f55745;
  height: 30px;
  color: #626262;
}
.rl-table th {
  color: #434343;
}
.footer .mu-tab-link-highlight {
  display: none;
}
</style>
