<template>
  <div class="page-item">
    <div class="pitem-head">
      <div class="pitem-head-l" @click="jskback">返回</div>
      登录
    </div>
    <el-form class="lp-con">
      <el-form-item label="用户名">
        <el-input v-model="userName" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="password" />
      </el-form-item>
      <el-form-item>
        <el-button @click="onlogin">登录</el-button>
        <el-button @click="jskgo('/register')">立即注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data () {
    return {
      userName: 'xulin',
      password: '123456'
    }
  },
  methods: {
    onlogin () {
      this.$jsk.ajax({
        url: '@/user/login',
        method: 'post',
        data: {
          userName: this.userName,
          password: this.password
        }
      }, (data) => {
        if ( data.result && data.result.id ) {
          this.$jsk.storageL(this.$jsk.userId, data.result.id)
          this.$jsk.storageL(this.$jsk.userName, data.result.userName)
          this.$jsk.storageL(this.$jsk.token, data.result.token)
          this.$jsk.userDataL(data.result)
          this.jskback()
        } else {
          this.$jsk.toast('登录失败，未知错误', 4)
        }
      })
    }
  }
}
</script>

<style>
.lp-con {
  padding: 15px;
}
</style>
