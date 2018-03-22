<template>
  <div class="page-body">
    <div class="content-body">
      <div class="from-box">
        <div>
          <mu-text-field v-model="formd.user" class="txtfield" label="用户名" hintText="请输入用户名"  labelFloat/>
        </div>
        <div>
          <mu-text-field v-model="formd.pwd" class="txtfield" label="密码" hintText="请输入密码" type="password" labelFloat/>
        </div>
        <mu-raised-button @click="fsubmit" label="提交" primary/>
      </div>
      <div class="test-btn">
        <mu-raised-button label="文字在后面" icon="grade" primary/>
      </div>
    </div>
  </div>
</template>
<script>
import md5 from 'js-md5';
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
    fsubmit () {
      let that = this,
          _url = `${that.$xljs.domainUrl}/ushop-api-merchant/api/user/login/auth/10007/${that.formd.user}/${md5(that.formd.pwd)}`;
      that.$xljs.ajax(_url, 'post', {}, ( data ) => {
        console.log(data);
        if ( data.userId ) {
          that.$xljs.storageL('ls_partly_loginfd', that.formd);
          that.$xljs.storageL(that.$xljs.userId, data.userId);
          that.$xljs.storageL(that.$xljs.token, data.token);
          that.$xljs.toast( '登录成功！' );
          that.$router.goBack();
        } else {
          that.$xljs.toast( (data.error_description || '未知错误') );
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
</style>
