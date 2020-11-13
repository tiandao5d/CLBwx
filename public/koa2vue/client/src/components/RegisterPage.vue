<template>
  <div class="page-item">
    <div class="pitem-head">
      <div class="pitem-head-l" @click="jskback">返回</div>
      注册
    </div>
    <el-form class="lp-con">
      <el-form-item label="用户名">
        <el-input v-model="userName" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="password" />
      </el-form-item>
      <el-form-item>
        <el-button @click="btnclick">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'RegisterPage',
  data () {
    return {
      userName: 'xulin',
      password: '123456'
    }
  },
  methods: {
    btnclick () {
      this.$jsk.ajax({
        url: '@/user/register',
        method: 'post',
        data: {
          userName: this.userName,
          password: this.password
        }
      }, (data) => {
        if ( data.code >= 80000 ) {
          this.jskback()
        } else {
          this.$jsk.toast(data.txt, 4)
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
