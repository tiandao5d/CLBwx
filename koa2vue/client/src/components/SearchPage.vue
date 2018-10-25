<template>
  <div class="page-item">
    <div class="pitem-head">
      <div class="pitem-head-l" @click="jskback">返回</div>
      搜索
    </div>
    <div class="fl-search">
      <el-input placeholder="请输入内容" v-model="searchstr">
        <el-button slot="append" @click="searchFn" icon="el-icon-search"></el-button>
      </el-input>
    </div>
    <div style="height: 5px;background:#ccc;"></div>
    <div class="fl-flist" :key="item.id" v-for="item in flist">
      <img :src="item.photo || dimg" alt="用户头像">
      <div class="fl-flist-txt">
        <span>{{item.userName}}</span>
        <span>没有说明</span>
      </div>
      <div class="fl-flist-btn">
        <el-button type="primary" size="mini" v-if="fids.indexOf(item.id) < 0" @click="addfriend(item)">加好友</el-button>
        <el-button type="info" size="mini" v-if="fids.indexOf(item.id) >= 0" @click="sendmsg(item)">发信息</el-button>
      </div>
    </div>
    <div class="fl-noflist" v-if="flist.length === 0">没有内容</div>
  </div>
</template>

<script>
import dimg from '../assets/uphoto.jpeg'
export default {
  data () {
    return {
      dimg,
      searchstr: '',
      flist: [],
      fids: []
    }
  },
  methods: {
    // 加好友
    addfriend ( uobj ) {
      this.$jsk.ajax({
        url: '/friend/add',
        data: { receiver: uobj.id },
        method: 'post'
      }, (data) => {
        if ( data.code >= 80000 ) {
          this.$jsk.addf(uobj)
          this.fids = this.$jsk.userFids
        } else {
          this.$jsk.toast(data.txt, 4)
        }
      })
    },
    // 发消息
    sendmsg ( uobj ) {
      this.jskgo(`/msg/${uobj.id}`)
    },
    // 搜索加好友
    searchFn () {
      let str = this.searchstr
			let p = null
			if ( /^\d+$/.test(str) ) {
				p = {id: str}
			} else {
				p = {userName: str}
			}
      let arr = [
        {
          method: 'post',
          url: '/user/getuser',
          data: p
        },
        {
          method: 'post',
          url: '/friend/get'
        }
      ]
      this.$jsk.ajax(arr, (data) => {
        let users = data[0].result || []
        this.$jsk.addf(data[1].result || []) // 重置本地数据
        this.fids = this.$jsk.userFids
        this.flist = users.filter((o) => {
          return (o.id !== this.$jsk.getUserId())
        })
      })
    }
  }
}
</script>

<style>
.fl-flist-btn {
  position: absolute;
  right: 15px;
  top: 11px;
}
</style>
