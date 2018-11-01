<template>
  <div class="page-item">
    <div class="pitem-head">朋友列表{{userName}}
      <span class="pitem-head-r" @click="showSearchFn">搜索</span>
    </div>
    <div style="height: 5px;background:#ccc;"></div>
    <div class="fl-flist" @click="itemclick(item)" :key="item.id" v-for="item in flist">
      <img :src="item.photo || dimg" alt="用户头像">
      <div class="fl-flist-txt">
        <span>{{item.userName}}</span>
        <span>没有最后的消息</span>
      </div>
    </div>
    <div class="fl-noflist" v-if="flist.length === 0">
      没有内容
    </div>
  </div>
</template>

<script>
import dimg from '../assets/uphoto.jpeg'
export default {
  data () {
    return {
      dimg,
      searchstr: '',
      searchshow: true,
      flist: [],
      userName: ''
    }
  },
  created () {
    if ( !this.$jsk.storageL(this.$jsk.userId) ) {
      this.jskgo('/login')
      return false
    }
    this.userName = this.$jsk.userDataL().userName || '***'
    this.getUserFlist()
  },
  methods: {
    // 获取用户的好友
    getUserFlist () {
      this.$jsk.ajax({
        url: '/friend/get',
        method: 'post'
      }, (data) => {
        if ( data.code >= 80000 ) {
          this.flist = data.result || []
          this.$jsk.addf(this.flist) // 重置本地数据
        }
      })
    },
    itemclick ( item ) {
      this.jskgo(`/msg/${item.id}`)
    },
    showSearchFn () {
      this.jskgo('/search')
    }
  }
}
</script>

<style>
.fl-flist {
  position: relative;
  padding: 10px 15px;
  font-size: 14px;
}
.fl-flist > img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
.fl-flist-txt {
  position: absolute;
  left: 55px;
  top: 5px;
  right: 15px;
  bottom: 5px;
}
.fl-flist-txt span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #888;
  line-height: 20px;
}
.fl-flist-txt span:first-child {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}
.fl-search {
  padding: 5px 15px 0;
  background: #ccc;
}
.fl-noflist {
  padding: 15px;
  text-align: center;
  color: #999;
}
</style>
