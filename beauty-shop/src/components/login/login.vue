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
      <button v-on:click="shuffle">Shuffle</button>
      <button v-on:click="add">add</button>
      <transition-group name="flip-list" tag="ul">
        <li v-for="item in items" :key="item" class="tt-list">
          {{ item }}
        </li>
      </transition-group>
    </div>
  </div>
</template>
<script>
import md5 from 'js-md5';
export default {
  data () {
    return {
      formd: {user: '', pwd: ''},
      items: [1,2,3,4,5,6,7,8,9],
      nn: 10
    }
  },
  mounted () {
    let fd = this.$xljs.storageL('ls_partly_loginfd') || {user: '', pwd: ''};
    this.formd = fd;
  },
  methods: {
    shuffle () {
      this.items.push(this.items.shift())
    },
    add () {
      this.items.push(this.nn);
      this.nn++;
    },
    fsubmit () {
      let that = this,
          _url = `${that.$xljs.domainUrl}/ushop-api-merchant/api/user/login/auth/10007/${that.formd.user}/${md5(that.formd.pwd)}`;
      that.$xljs.ajax(_url, 'post', {}, ( data ) => {
        if ( data.userId ) {
          that.$xljs.storageL('ls_partly_loginfd', {user: that.formd.user, pwd: ''});
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
.flip-list-enter, .flip-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.tt-list {
  transition: transform .3s;
}
</style>
