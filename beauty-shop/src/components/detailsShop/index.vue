<template>
  <div class="page-body">
    <div class="content-body">
      <div class="ds-body">
        <img class="ds-banner" :src="item.url">
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
            <span>{{'湖北省' + item.district + item.address}}</span>
          </div>
          <div class="ds-p">
            <strong>站主姓名：</strong>
            <span>{{item.name}}</span>
          </div>
          <div class="ds-p">
            <strong>联系方式：</strong>
            <span>{{item.phone}}</span>
          </div>
          <div class="ds-p">
            <strong>站点服务及业绩：</strong>
            <span class="ds-p-p">{{item.remark}}</span>
          </div>
          <div class="ds-num">
            <div class="ds-num-p">当前票数：<span>{{item.score}}</span></div>
            <div class="ds-num-p">当前排名：<span>{{item.ranking}}</span></div>
          </div>
        </div>
      </div>
      <div class="ds-foot clearfix">
        <mu-raised-button label="投 票" @click="voteSubmit" class="raised-button" />
        <mu-raised-button label="分 享" @click="shareClick" class="raised-button right" />
      </div>
    </div>
  </div>
</template>
<script>
import pageBg3 from '@/assets/image/bs/add_shop003.jpg';

export default {
  data() {
    return {
      bannerImg: pageBg3,
      item: {}
    }
  },
  created() {
    // 页面数据初始化
    this.pageInit()
  },
  methods: {
    // 页面数据并发请求
    pageInit() {
      let that = this,
          item = that.$route.params.item || that.$xljs.storageL('ls_partly_worksitem') || {};
      if (item.id) {
        that.item = item;
        that.$xljs.storageL('ls_partly_worksitem', item);
      } else {
        console.log('数据错误')
      }
    },
    voteSubmit() {
      // this.$emit('voteSubmit', this.item);
    },
    shareClick() {
      // this.$emit('shareClick', this.item);
    }
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
  bottom: 56px;
  top: 0;
  left: 0;
  right: 0;
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
