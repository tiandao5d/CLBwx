<template>
  <div class="page-body">
    <div class="content-body">
      <img :src="pageBg2" :style="{'width': '100%'}">
      <div class="form-box">
        <div class="form-con" :style="{'backgroundImage': 'url(' + pageBg1 + ')'}">
          <div class="input-group">
            <label>站点编号：</label>
            <input type="text" placeholder="请填写正确的站点编号">
          </div>
          <div class="input-group">
            <label>所在地区：</label>
            <select>
              <option v-for="item, index in provinceData" :key="index" :value="item.value">{{item.desc}}</option>
            </select>
          </div>
          <div class="input-group">
            <label>站点地址：</label>
            <input type="text" placeholder="请填写真实住址">
          </div>
          <div class="input-group">
            <label>站主姓名：</label>
            <input type="text" placeholder="请填写真实姓名">
          </div>
          <div class="input-group">
            <label>联系方式：</label>
            <input type="text" placeholder="请填写正确的联系方式">
          </div>
          <div class="input-group">
            <label>站点服务及业绩：</label>
            <textarea placeholder="介绍文字300字以内"></textarea>
          </div>
          <div class="add-img">
            <div class="addimg-item" v-for="img, index in addimgArr" :key="index">
              <img class="addimg-img" :src="img">
              <mu-float-button class="addimg-close" @click="img_close(index)" mini icon="close" backgroundColor="#f00"/>
            </div>
            <div class="addimg-btn" v-if="addimgArr.length < 3" @click="addimgClick">
              <input type="file" class="form-file" id="form_file" @change="img_edit">
              <mu-icon value="add" color="#959595" :size="30"/>
              <span>添加照片</span>
            </div>
          </div>
        </div>
      </div>
      <div class="form-foot">
        <img class="form-foot-img" :src="pageBg3">
        <div class="form-foot-con">
          <mu-raised-button @click="formSubmit" label="立即报名" class="raised-button"/>
        </div>
      </div>
      <div style="height: 30px;"></div>
      <cropper-box ref="cropper"></cropper-box>
      <div class="alert-box" v-if="alertActive">
        <!-- 不通过 -->
        <div class="alert-item" v-if="alertActive === 'alert1'">
          <img class="alert-img" :src="pageBg4">
          <div class="alert-btn1" @click="alertClose"></div>
        </div>
        <!-- 通过 -->
        <div class="alert-item" v-if="alertActive === 'alert2'">
          <img class="alert-img" :src="pageBg5">
          <div class="alert-btn2"></div>
        </div>
        <!-- 提交成功 -->
        <div class="alert-item" v-if="alertActive === 'alert3'">
          <img class="alert-img" :src="pageBg6">
          <div class="alert-btn3" @click="alertClose"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import pageBg1 from '@/assets/image/bs/add_shop001.png';
import pageBg2 from '@/assets/image/bs/add_shop002.jpg';
import pageBg3 from '@/assets/image/bs/add_shop003.jpg';
import pageBg4 from '@/assets/image/bs/add_shop004.png';
import pageBg5 from '@/assets/image/bs/add_shop005.png';
import pageBg6 from '@/assets/image/bs/add_shop006.png';

import CropperBox from '@/components/sharing/crop';

import provinceData from '@/assets/json/province.js';
export default {
  data () {
    return {
      pageBg1,
      pageBg2,
      pageBg3,
      pageBg4,
      pageBg5,
      pageBg6,
      alertActive: 'alert3',
      provinceData,
      addimgArr: [],
      game2: 1
    }
  },
  created () {
    // 页面数据初始化
    this.pageInit()
  },
  methods: {
    // 页面数据并发请求
    pageInit () {
    },
    // 图片编辑
    img_edit ( e ) {
      let that = this,
          _file = e.target.files[0],
          bs64 = '',
          rf = new FileReader();
      rf.readAsDataURL(_file);
      rf.onload = function(){
        that.$refs.cropper.showcrop( rf.result )
      }
    },
    alertClose () {
      this.alertActive = false;
    },
    //删除图片
    img_close ( index ) {
      this.addimgArr.splice(index, 1);
    },
    //图片编辑后回调
    cropCb ( data ) {
      this.addimgArr.push(data.bs64)
    },
    addimgClick () {
      let fileIpt = document.getElementById('form_file');
      fileIpt.click();
    },
    formSubmit () {
      console.log()
    }
  },
  components: {
    CropperBox
  }
}
</script>
<style scoped>
.page-body {
  background-color: #feeecc;
}
.form-box {
  position: relative;
  width: 86%;
  margin: 0 auto;
  margin-top: -22%;
  z-index: 10;
}
.form-con {
  padding: 0 8%;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.form-foot {
  position: relative;
}
.form-foot-img {
  display: block;
  width: 100%;
  margin: 0 auto;
}
.form-foot-con {
  position: absolute;
  left: 7%;
  top: 25%;
  padding: 0 8%;
  width: 86%;
  text-align: center;
}
.raised-button {
  border-radius: 50px;
  background-color: #ffa818;
  color: #fff;
  width: 60%;
  font-size: 18px;
  font-weight: bold;
}
.addimg-btn {
  position: relative;
  margin: 5px;
  display: inline-block;
  color: #959595;
  font-size: 15px;
  text-align: center;
  padding: 8px;
  width: 80px;
  height: 80px;
  overflow: hidden;
  background-color: #fff;
  border: dashed 2px #ffa818;
  vertical-align: top;
}
.addimg-btn span {
  display: block;
}
.addimg-item {
  position: relative;
  display: inline-block;
  vertical-align: top;
  margin: 10px;
}
.addimg-close {
  position: absolute;
  right: -15px;
  top: -15px;
}
.addimg-img {
  border-radius: 10px;
  width: 80px;
  height: 80px;
}
.form-file {
  display: none;
}
.input-group {
  padding-bottom: 10px;
}
.input-group label {
  display: block;
  font-size: 15px;
  color: #ff7701;
  line-height: 26px;
}
.input-group input,
.input-group select,
.input-group textarea {
  border: 0;
  background-color: #fff;
  display: block;
  width: 100%;
  line-height: 1;
  font-size: 14px;
  padding: 7px 5px;
  color: #616161;
}
.input-group textarea {
  height: 85px;
  padding: 5px;
  resize: none;
}
.alert-box {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0,0,0,.7);
  z-index: 100;
}
.alert-item {
  position: absolute;
  left: 12%;
  top: 20%;
  width: 75%;
  text-align: center;
}
.alert-img {
  width: 100%;
}
.alert-btn1,
.alert-btn2 {
  position: absolute;
  left: 29%;
  right: 29%;
  bottom: 29%;
  top: 58%;
}
.alert-btn3 {
  position: absolute;
  left: 45%;
  right: 43%;
  bottom: 7%;
  top: 77%;
}
</style>
