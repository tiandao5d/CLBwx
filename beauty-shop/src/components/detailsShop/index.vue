<template>
  <div class="page-body">
    <div class="content-body">
      <div class="ds-body">
        <img class="ds-banner" :src="item.url || p31">
        <div style="height: 3px;"></div>
        <div class="ds-con">
          <div class="ds-p">
            <strong>站点编号：</strong>
            <span>{{item.serialNo}}</span>
          </div>
          <div class="ds-p">
            <strong>所在地区：</strong>
            <span>{{item.district}}</span>
          </div>
          <div class="ds-p">
            <strong>站点地址：</strong>
            <span>{{'湖北省' + (item.district || '') + (item.address || '')}}</span>
          </div>
          <div class="ds-p" v-if="isme">
            <strong>站主姓名：</strong>
            <span>{{item.name}}</span>
          </div>
          <div class="ds-p" v-if="isme">
            <strong>联系方式：</strong>
            <span>{{item.phone}}</span>
          </div>
          <div class="ds-p">
            <strong>站点服务及业绩：</strong>
            <span class="ds-p-p">{{item.remark}}</span>
          </div>
          <div class="ds-num" v-if="status === 103 || status === 104">
            <div class="ds-num-p">当前票数：<span>{{item.score}}</span></div>
            <div class="ds-num-p">当前排名：<span>{{item.ranking}}</span></div>
          </div>
        </div>
      </div>
      <div class="ds-foot clearfix" v-if="status === 103">
        <mu-raised-button label="投 票" @click="voteSubmit" class="raised-button" />
        <mu-raised-button label="分 享" @click="shareClick" class="raised-button right" />
      </div>
      <mu-dialog :open="voteDialog" title="投票成功" @close="voteClose">
        <p>感谢您投的宝贵一票{{voteGap}}！您可以：</p>
        <p>1.每天参与投票，每天最多可以投{{voteLimit}}票</p>
        <p>2.邀请更多小伙伴来参与投票</p>
        <mu-flat-button slot="actions" @click="voteClose" primary label="确定"/>
        <mu-flat-button slot="actions" primary @click="voteClose('confrim')" label="为我拉票"/>
      </mu-dialog>
      <share-dailog ref="shareda"/>
    </div>
  </div>
</template>
<script>
import pageBg3 from '@/assets/image/bs/add_shop003.jpg';
import p31 from '@/assets/image/p300100.png';
import ShareDailog from '@/components/share'; // 分享弹窗

export default {
  data() {
    return {
      bannerImg: pageBg3,
      p31: p31,
      item: {},
      voteDialog: false,
      isme: false,
      voteGap: '', // 中奖机会字符串，投票后的提示相关
      voteLimit: 0, // 每天投票上线
      status: 0
    }
  },
  mounted () {
    // 页面数据初始化
    this.pageInit()
  },
  methods: {
    // 页面数据并发请求
    pageInit() {
      let that = this,
          ud = that.$xljs.deCodeUrlFn(),
          actdata = that.$xljs.actSession();
      that.status = actdata.status;
      that.voteLimit = actdata.voteLimit;
      if ( ud.serialNo ) {
        that.getWorksList ( ud.serialNo ); // 查询指定站点
      } else if ( ud.me ) {
        that.isme = true;
        that.getWorksList ( '', ud.me ); // 查询自己
      } else {
        that.$xljs.toast('数据错误！');
      }
    },
    // 获取候选作品列表
    getWorksList ( serialNo = '', _self = '' ) {
      let that = this,
          _url = '/ushop-api-merchant/api/sns/vote/candidate/listBy',
          _param = {
            page: 1,
            rows: 10,
            serialNo: serialNo, // 站点编号
            district: '', // 地区
            electionId: that.$xljs.actSession().id, // 活动ID
            self: _self
          };
      that.$xljs.ajax(_url, 'get', _param, ( data ) => {
        if ( data.recordList ) {
          if ( data.totalCount === 0 ) { // 未查到任何数据
            that.$xljs.toast('您未参与此次活动报名');
            return false;
          }
          that.item = data.recordList[0];
          that.$xljs.storageL('ls_partly_worksitem', that.item);
        } else {
          that.$xljs.toast((data.error_description || '未能请求到相关数据'));
        }
      });
    },
    shareClick() {
      this.$refs.shareda.show(this.item);
    },
    voteClose () {
      let that = this;
      that.voteDialog = false;
      if ( arguments[0] === 'confrim' ) {
        that.$refs.shareda.show(this.item);
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
    voteSubmit () {
      let that = this,
          _url = `/ushop-api-merchant/api/sns/vote/voter/submit/${that.$xljs.actSession().id}/${that.item.id}`;
      that.$xljs.ajax(_url, 'post', {}, (data) => {
        if ( data.result === 'SUCCESS' ) {
          that.item.score += 1;
          gap = that.getNearNum(that.item.score);
          if ( gap > 0 ) {
            that.voteGap = `，还差${gap}票就可以获得抽奖机会哦`;
          } else {
            that.voteGap = '';
          }
          that.voteDialog = true;
        } else {
          that.$xljs.toast((data.error_description || '投票失败，未知错误'));
        }
      })
    },
  },
  components: {
    ShareDailog
  }
}

</script>
<style scoped>
.ds-box {
  position: absolute;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #fff;
}

.ds-body {
  position: absolute;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
  padding-bottom: 56px;
  overflow-x: hidden;
  overflow-y: auto;
}

.ds-banner {
  width: 100%;
}

.ds-con {
  position: relative;
  background-color: #fff;
  padding: 0 15px;
}

.ds-p {
  line-height: 30px;
  color: #727272;
}

.ds-p-p {
  display: block;
  text-align: justify;
}

.ds-p strong {
  color: #535353;
}

.ds-num {
  position: absolute;
  right: 0;
  top: 0;
  background-color: #ffc526;
  color: #fff;
  padding: 3px 6px;
}

.ds-num-p span {
  color: #fd3b39;
}

.ds-foot {
  position: absolute;
  left: 0;
  bottom: 0;
  background-color: #eee;
  padding: 10px 20px;
  width: 100%;
}

.raised-button {
  border-radius: 10px;
  background-color: #ff6600;
  color: #fff;
  width: 40%;
  float: left;
  font-size: 15px;
}

.raised-button.right {
  float: right;
  background-color: #ffa818;
}

</style>
