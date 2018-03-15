<template>
  <div class="page-body">
    <div class="content-body">
      <banner-swiper :list="bannerList"></banner-swiper>
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
          <div class="clearfix plist-ul">
            <product-list
              @voteSubmit="voteSubmit" :status="listType"
              v-for="item, index in productlist" :item="item" :key="index">
            </product-list>
          </div>
          <scroll-bottom :scroller="scroller" :loading="loading" @load="loadMore"></scroll-bottom>
        </div>
      </div>
      <foot-tabs :value="footActive" :tabarr="tabarr" @change="footTabChange"></foot-tabs>
      <city-list ref="province" :ctarr="titletabs"/>
      <mu-dialog :open="footActive === 'tab2'" title="搜索站点编号" @close="sdailogSH">
        <mu-text-field class="foot-tf" v-model="sdIptVal" type="number" @focus="iptErrObj.sderr = ''" :errorText="iptErrObj.sderr" hintText="请输入投注站编号"/>
        <mu-flat-button slot="actions" @click="sdailogSH" primary label="取消"/>
        <mu-flat-button slot="actions" primary @click="sdailogSH('primary')" label="确定"/>
      </mu-dialog>
      <mu-dialog :open="voteDialog" title="投票成功" @close="voteClose">
        感谢您投的宝贵一票，还差1票就可以获得抽奖机会哦！
        <mu-flat-button slot="actions" @click="voteClose" primary label="取消"/>
        <mu-flat-button slot="actions" primary @click="voteClose('confrim')" label="为我拉票"/>
      </mu-dialog>
      <share-dailog ref="shareda"/>
    </div>
  </div>
</template>

<script>
import BannerSwiper from '@/components/sharing/banner'; // banner
import ProductList from './product_list'; // 商品列表
import ScrollBottom from '@/components/sharing/scrollbottom'; // 滚动到底部加载
import ctData from '@/assets/json/city.show.js'; // 省份数据
import cityList from '@/components/sharing/cityselect'; // 省份列表
import FootTabs from '@/components/sharing/foot'; // 底部菜单
import ShareDailog from '@/components/share'; // 底部菜单
export default {
  data () {
    let listParam = {},
        plen = ctData.length;
    for ( let i = 0; i < plen; i++ ) {
      listParam[('p' + ctData[i].val)] = {
        currentPage: 0, // 当前页
        totalCount: 1, // 总个数
        pagePage: 1, // 总页数
        recordList: [], // 数据内容
        ct: ctData[i]
      };
    }
    return {
      loading: false,
      scroller: null,
      productlist: [],
      bannerList: [], // 储存banner图数据
      titletabs: ctData, // 储存抬头数据
      titleActive: ctData[0].val, // 储存选中的抬头
      footActive: 'tab1',
      oldFootA: '', // 记录旧的选择
      listType: false,
      voteDialog: false,
      shareItem: {},
      sdIptVal: '',
      dailies: 0, // 此用户今天投票的数量
      iptErrObj: {
        sderr: ''
      },
      listParam: listParam,
      tabarr: [
        {txt: '参选站点', val: 'tab1', href: '/', icon: 'cxzd'},
        {txt: '搜索', val: 'tab2', href: '', icon: 'ss', fn: this.sdailogSH},
        {txt: '我的报名', val: 'tab3', href: '/addShop', icon: 'wdbm'},
        {txt: '活动说明', val: 'tab4', href: '/totalNum', icon: 'hdsm'}
      ]
    }
  },
  mounted () {
    let that = this;
    // 页面数据初始化
    that.pageInit();
    that.scroller = that.$el.querySelector('.tabs-content');
    if ( that.$xljs.actSession().status === 103 ) {
      that.listType = true;
    }
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
      let that = this,
          id = that.$xljs.actSession().id,
          pid = that.$xljs.localProL().id || 0;
      that.getWorksList();
      that.$xljs.ajaxAll([
        {url: `${that.$xljs.domainUrl}/ushop-api-merchant/api/sns/notify/banner/list/6/${pid}.json`},
        {url: `/ushop-api-merchant/api/sns/vote/voter/get/${id}`}
      ], function () {
        that.bannerInit(arguments[0]);
        that.dailies = arguments[1].dailies;
      });
    },
    //查看更多省份列表
    tabs_more () {
      let that = this;
      that.$refs.province.showCom()
    },
    // banner图初始化
    bannerInit (obj) {
      let that = this;
      let arr = obj.recordList || [];
      arr = arr.map((o, i) => {
        return o.pictureAddress
      })
      that.bannerList = arr;
    },
    // 搜索显示隐藏
    sdailogSH () {
      let that = this;
      if ( arguments[0] === 'show' ) {
        that.footActive = 'tab2';
      } else {
        if ( that.sdIptVal ) {
          // 显示搜索内容
          console.log(that.sdIptVal);
        } else if (arguments[0] === 'primary') {
          that.iptErrObj.sderr = '不能为空';
          return false;
        }
        that.footActive = that.oldFootA;
      }
    },
    voteClose () {
      let that = this;
      that.voteDialog = false;
      if ( arguments[0] === 'confrim' ) {
        that.$refs.shareda.show(that.shareItem);
      }
    },
    // 投票点击事件
    voteSubmit ( item ) {
      let that = this,
          _url = `/ushop-api-merchant/api/sns/vote/voter/submit/${that.$xljs.actSession().id}/${item.id}`;
      that.voteDialog = true;
      that.shareItem = item;
      return false;
      if ( that.$xljs.actSession().voteLimit > that.dailies ) {
        that.$xljs.ajax(_url, 'post', {}, (data) => {
          if ( data.result === 'SUCCESS' ) {
            that.voteDialog = true;
            that.shareItem = item;
            that.dailies++;
          }
        })
      }
    },
    // 获取候选作品列表
    getWorksList ( np ) {
      let that = this,
          cp = that.listParam[('p' + that.titleActive)],
          _url = '/ushop-api-merchant/api/sns/vote/candidate/listBy',
          _param = {
            page: cp.currentPage + 1,
            rows: 10,
            serialNo: cp.ct.txt,
            electionId: that.$xljs.actSession().id,
            self: ''
          };
      if ( np instanceof Object ) {
        that.$xljs.extend( _param, np );
      }
      _param = {};
      that.$xljs.ajax(_url, 'get', _param, ( data ) => {
        if ( data.recordList ) {
          cp.currentPage = data.currentPage;
          cp.totalCount = data.totalCount;
          cp.pagePage = data.pagePage;
          if ( data.currentPage === 1 ) {
            cp.recordList = data.recordList;
          } else {
            cp.recordList = cp.recordList.concat(data.recordList);
          }
          that.loading = false; // 加载更多消失
        }
        that.productlist = cp.recordList;
      }, false);
    },
    // tab抬头切换
    titleTabChange ( val ) {
      this.titleActive = val;
      let that = this,
          cp = that.listParam[('p' + that.titleActive)];
      if ( cp.currentPage === 0 ) {
        that.getWorksList();
      } else {
        that.productlist = cp.recordList;
      }
    },
    footTabChange ( val ) {
      let that = this,
          item;
      that.oldFootA = that.footActive;
      that.footActive = val;
      if ( val === 'tab2' ) { // 搜索
        return false;
      }
      that.$xljs.each(that.tabarr, (index, obj) => {
        if ( obj.val === val ) {
          item = obj;
          return false;
        }
      });
      that.$router.push(item.href);
    },
    loadMore () {
      let that = this,
          cp = that.listParam[('p' + that.titleActive)];
      if ( cp.currentPage < cp.pagePage ) {
        that.loading = true;
        that.getWorksList();
      }
    }
  },
  components: {
    BannerSwiper,
    ProductList,
    ScrollBottom,
    cityList,
    FootTabs,
    ShareDailog
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
.foot-tf {
  width: 100%;
}
</style>
