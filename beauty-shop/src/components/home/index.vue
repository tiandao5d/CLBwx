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
          <div class="h-total" v-if="listType">
            <div class="htotal-item">
              <div class="htotal-p">全省参与站点</div>
              <div class="htotal-p">{{htotal.selects}}</div>
            </div>
            <div class="htotal-item">
              <div class="htotal-p">累计总票数</div>
              <div class="htotal-p">{{htotal.participants}}</div>
            </div>
            <div class="htotal-item">
              <div class="htotal-p">总访问量</div>
              <div class="htotal-p">{{htotal.pageViews}}</div>
            </div>
          </div>
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
        <p>感谢您投的宝贵一票{{voteGap}}！您可以：</p>
        <p>1.每天参与投票，每天最多可以投{{voteLimit}}票</p>
        <p>2.邀请更多小伙伴来参与投票</p>
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
import ctData from '@/assets/json/city.show.js'; // 城市数据
import cityList from '@/components/sharing/cityselect'; // 城市列表选择组件
import FootTabs from '@/components/sharing/foot'; // 底部菜单
import ShareDailog from '@/components/share'; // 分享弹窗
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
        ct: ctData[i] // 地区的文字和代号
      };
    }
    return {
      loading: false,
      scroller: null,
      productlist: [],
      bannerList: [], // 储存banner图数据
      titletabs: ctData, // 储存抬头数据
      titleActive: ctData[0].val, // 储存选中的抬头
      listType: false, // 根据状态显示是否可以投票
      voteDialog: false, // 控制投票后的弹窗显示
      shareItem: {}, // 记录投票的站点数据，以便于分享
      voteLimit: 0, // 每天投票上线
      sdIptVal: '', // 搜索的输入框值
      iptErrObj: { // 搜索的输入框值报错
        sderr: ''
      },
      voteGap: '', // 中奖机会字符串，投票后的提示相关
      htotal: {
        selects: 0, // 总报名数
        participants: 0, // 总参与数量
        pageViews: 0 // 总访问数量
      },
      listParam: listParam, // 记录列表翻页数据
      footActive: 'tab1', // 控制底部菜单选中
      tabarr: [ // 底部菜单数据
        {txt: '参选站点', val: 'tab1', href: '/home', icon: 'cxzd'},
        {txt: '搜索', val: 'tab2', href: '', icon: 'ss', fn: this.sdailogSH},
        {txt: '我的报名', val: 'tab3', href: '/detailsShop?me=1', icon: 'wdbm'},
        {txt: '我的投票', val: 'tab4', href: '/myVote', icon: 'wdtp'}
      ]
    }
  },
  mounted () {
    let that = this;
    // 页面数据初始化
    that.pageInit();
    that.scroller = that.$el.querySelector('.tabs-content');
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
          actdata = that.$xljs.actSession(),
          harr = actdata.header || '[]';
      try {
        harr = JSON.parse(harr);
      } catch (err) {
        harr = [];
      };
      if ( actdata.status === 103 ) {
        that.htotal = {
          selects: actdata.selects, // 总报名数
          participants: actdata.participants, // 总参与数量
          pageViews: actdata.pageViews // 总访问数量
        }
        that.listType = true;
        that.tabarr = [
          {txt: '投票', val: 'tab1', href: '/home', icon: 'tp'},
          {txt: '搜索', val: 'tab2', href: '', icon: 'ss', fn: that.sdailogSH},
          {txt: '排行榜', val: 'tab3', href: '/rankingList', icon: 'phb'},
          {txt: '我的投票', val: 'tab4', href: '/myVote', icon: 'wdtp'}
        ]
      }
      if ( that.$route.params.searchtrue ) {
        that.footActive = 'tab2';
      }
      that.voteLimit = actdata.voteLimit;
      that.getWorksList(); // 获取作品列表
      that.bannerInit(harr); // 显示banner图片
      that.getUserVote(); // 获取用户投票数据
    },
    // 获取用户投票数据
    getUserVote () {
      let that = this,
          _url = `/ushop-api-merchant/api/sns/vote/voter/get/${that.$xljs.bsid}`;
      that.$xljs.ajax(_url, 'get', {}, (data) => {
        let lp = +new Date(data.prizeTime), // 最后奖励时间
            lc = +new Date(data.cashTime); // 最后查奖时间
        try {
          data.experience = JSON.parse(data.experience);
        } catch ( err ) {
          data.experience = [];
        }
        that.$xljs.actSession({userVote: data});
        if ( Math.abs(lp - lc) > 60000 ) {
          that.getLuckyList( data.cashTime ); // 获取用户的抽奖游戏券
        }
      });
    },
    // 获取用户的抽奖游戏券
    getLuckyList ( dt = '' ) {
      let that = this,
          _url = '/ushop-api-merchant/api/lotto/ticket/user/listBy',
          _param = {
            page: 1,
            gameId: that.$xljs.lcid,
            status: 1, // 全部=100 未开奖=1 未中奖=2 已中奖-3 已弃奖=6
            date: dt
          };
      that.$xljs.ajax(_url, 'get', _param, (data) => {
        if ( data.recordList ) {
          that.getPrize();
        } else {
          setTimeout(() => {
            that.getLuckyList(dt);
          }, 3000);
        }
      }, false); // 后台操作，不需要遮屏
    },
    // 领取奖励
    getPrize () {
      let that = this,
          _url = `/ushop-api-merchant/api/sns/vote/canvassing/prize/${that.$xljs.bsid}`;
      that.$xljs.ajax(_url, 'get', {}, (data) => {
        // 领奖后台操作，不需要做任何处理
      }, false); // 后台操作，不需要遮屏
    },
    //查看更多省份列表
    tabs_more () {
      let that = this;
      that.$refs.province.showCom();
    },
    // banner图初始化
    bannerInit ( arr ) {
      let that = this;
      arr = arr.map((o, i) => {
        return o.value;
      });
      that.bannerList = arr;
    },
    // 搜索显示隐藏
    sdailogSH () {
      let that = this;
      if ( arguments[0] === 'show' ) {
        that.footActive = 'tab2';
      } else {
        if ( arguments[0] === 'primary' ) {
          if ( that.sdIptVal ) {
            // 显示搜索内容
            that.getWorksList({serialNo: that.sdIptVal, district: '', page: 1}, true);
          } else {
            that.iptErrObj.sderr = '不能为空';
            return false;
          }
        }
        that.footActive = 'tab1';
      }
    },
    voteClose () {
      let that = this;
      that.voteDialog = false;
      if ( arguments[0] === 'confrim' ) {
        that.$refs.shareda.show(that.shareItem);
      }
    },
    // 获取临近的可领奖票数
    getNearNum ( num = 0 ) {
      let that = this,
          adata = that.$xljs.actSession(),
          maxarr = [];
      that.$xljs.each(adata.pobj.pPlanC, (i, a) => {
        if ( i < adata.pobj.pPlan && a[3] > num ) {
          maxarr[maxarr.length] = num;
        }
      });
      if ( maxarr.length > 1 ) {
        return (Math.min.apply(null, maxarr) - num);
      } else if ( maxarr.length === 1 ) {
        return (maxarr[0] - num);
      } else {
        return 0;
      }
    },
    // 投票点击事件
    voteSubmit ( item ) {
      let that = this,
          cp = that.listParam[('p' + that.titleActive)],
          gap = 0,
          _url = `/ushop-api-merchant/api/sns/vote/voter/submit/${that.$xljs.bsid}/${item.id}`;
          that.voteDialog = true; // 弹出提示成功的窗口
      that.$xljs.ajax(_url, 'post', {}, (data) => {
        if ( data.result === 'SUCCESS' ) {
          that.getLuckyList( data.cashTime ); // 获取用户的抽奖游戏券
          // that.voteGap = '，还差1票就可以获得抽奖机会哦';
          that.$xljs.each(cp.recordList, (i, v) => {
            if ( v.id === item.id ) {
              v.score += 1; // 给相应的站点票数加1
              gap = that.getNearNum(v.score);
              return false;
            }
          });
          if ( gap > 0 ) {
            that.voteGap = `，还差${gap}票就可以获得抽奖机会哦`;
          } else {
            that.voteGap = '';
          }
          that.htotal.participants += 1; // 给总票数加1
          that.voteDialog = true; // 弹出提示成功的窗口
          that.shareItem = item; // 记录当前的站点数据
        } else {
          that.$xljs.toast( (data.error_description || '未知错误') );
        }
      })
    },
    // 获取候选作品列表
    getWorksList ( np ) {
      let that = this,
          cp = that.listParam[('p' + that.titleActive)],
          _url = '/ushop-api-merchant/api/sns/vote/candidate/listBy',
          _param = {
            page: cp.currentPage + 1,
            rows: 10,
            serialNo: '', // 站点编号
            district: cp.ct.val, // 地区
            electionId: that.$xljs.bsid, // 活动ID
            self: ''
          };
      if ( np instanceof Object ) {
        that.$xljs.extend( _param, np );
      }
      that.$xljs.ajax(_url, 'get', _param, ( data ) => {
        if ( data.recordList ) {
          that.loading = false; // 加载更多消失
          if ( arguments[1] ) {
            if ( data.totalCount === 0 ) { // 未查到任何数据
              that.$xljs.toast( '未查询到任何数据' );
              return false;
            } else if ( data.totalCount > 0 ) {
              that.titleActive = data.recordList[0].district;
              cp = that.listParam[('p' + data.recordList[0].district)]; // 重置cp数据，这是通过站点号直接查询的
            }
          }
          cp.currentPage = data.currentPage;
          cp.totalCount = data.totalCount;
          cp.pagePage = data.pagePage;
          if ( data.currentPage === 1 ) {
            cp.recordList = data.recordList;
          } else {
            cp.recordList = cp.recordList.concat(data.recordList);
          }
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
.h-total {
  display: flex;
  padding: 8px 0;
  text-align: center;
  font-size: 15px;
  background-color: #fff3e8;
  color: #535353;
}
.htotal-item {
  flex-grow: 1;
}
</style>
