<template>
  <div class="page-item">
    <group>
      <x-input @on-enter="fsubmit" title="用户名：" v-model="formd.user"/>
    </group>
    <group>
      <x-input @on-enter="fsubmit" title="密　码：" v-model="formd.pwd"/>
    </group>
    <group>
      <x-button text="登录" @click.native="fsubmit"/>
    </group>
  </div>
</template>
<script>

import md5 from 'js-md5'

export default {
  data () {
    return {
      formd: {user: '', pwd: ''}
    }
  },
  mounted () {
    let fd = this.$xljs.storageL('ls_partly_loginfd') || {user: '', pwd: ''};
    this.formd = fd;
  },
  methods: {
    boxyy () {
      this.$xljs.userInfoL(function () {
        console.log(arguments)
      })
    },
    fsubmit () {
      let that = this,
          _url = `${that.$xljs.domainUrl}/ushop-api-merchant/api/user/login/auth/10007/${that.formd.user}/${md5(that.formd.pwd)}`
      if ( !(that.formd.user && that.formd.pwd) ) {
        that.$vux.toast.text('请输入用户名和密码')
        return false;
      }
      that.$xljs.ajax(_url, 'post', {}, function ( data ) {
        if ( data.userId ) {
          that.$xljs.storageL('ls_partly_loginfd', {user: that.formd.user, pwd: ''})
          that.$xljs.storageL(that.$xljs.userId, data.userId)
          that.$xljs.storageL(that.$xljs.token, data.token)
          that.$vux.toast.text('登录成功！')
        } else {
          that.$vux.toast.text(('登录失败 ' + ( data.error_description || '未知错误' )))
        }
      });
    }
  }
}
</script>
<style scoped>
.from-box {
  padding: 0 15px;
}
.txtfield {
  width: 100%;
}
.test-btn {
  padding: 20px 10px;
  text-align: center;
}
.flip-list-enter, .flip-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.tt-list {
  transition: transform .3s;
}
</style>
