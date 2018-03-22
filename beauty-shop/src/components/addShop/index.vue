<template>
  <div class="page-body">
    <div class="content-body">
      <div class="form-box-s">
        <img :src="pageBg2" :style="{'width': '100%'}">
        <div class="form-box">
          <div class="form-con" :style="{'backgroundImage': 'url(' + pageBg1 + ')'}">
            <div class="input-group">
              <label>站点编号：</label>
              <input v-model="fromData.serialNo.val" type="text" placeholder="请填写正确的站点编号">
            </div>
            <div class="input-group">
              <label>所在地区：</label>
              <input type="text" v-model="fromData.district.txt" placeholder="点击选择地区" readonly @click="bottomSheetSH('show')">
            </div>
            <div class="input-group">
              <label>站点地址：</label>
              <input v-model="fromData.address.val" type="text" placeholder="请填写真实住址">
            </div>
            <div class="input-group">
              <label>站主姓名：</label>
              <input type="text" v-model="fromData.name.val" placeholder="请填写真实姓名">
            </div>
            <div class="input-group">
              <label>联系方式：</label>
              <input type="text" v-model="fromData.phone.val" placeholder="请填写正确的联系方式">
            </div>
            <div class="input-group">
              <label>站点服务及业绩：</label>
              <textarea v-model="fromData.remark.val" placeholder="介绍文字300字以内"></textarea>
            </div>
            <div class="add-img">
              <div class="addimg-item" v-for="item, index in addimgArr" :key="index">
                <img class="addimg-img" :src="item.bs64">
                <mu-float-button class="addimg-close" @click="img_close(index)" mini icon="close" backgroundColor="#f00"/>
              </div>
              <div class="addimg-btn" v-if="addimgArr.length < 1" @click="addimgClick">
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
      </div>
      <cropper-box ref="cropper"></cropper-box>
      <div class="alert-box" v-if="alertActive">
        <!-- 不通过 -->
        <div class="alert-item" v-if="alertActive === 'alert1'">
          <img class="alert-img" :src="pageBg4">
          <div class="alert-btn1" @click="alertBtnClick(1)"></div>
        </div>
        <!-- 通过 -->
        <div class="alert-item" v-if="alertActive === 'alert2'">
          <img class="alert-img" :src="pageBg5">
          <div class="alert-btn2" @click="alertBtnClick(2)"></div>
        </div>
        <!-- 提交成功 -->
        <div class="alert-item" v-if="alertActive === 'alert3'">
          <img class="alert-img" :src="pageBg6">
          <div class="alert-btn3" @click="alertBtnClick(3)"></div>
        </div>
      </div>
      <mu-bottom-sheet :open="bottomSheet" @close="bottomSheetSH('hide')">
        <mu-list @change="cityChange">
          <mu-sub-header>请选择</mu-sub-header>
          <div class="city-box">
            <mu-list-item v-for="item, index in cityArr" :key="index" :value="item.val" :title="item.txt"/>
          </div>
        </mu-list>
      </mu-bottom-sheet>
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

import cityArr from '@/assets/json/city.show.js';

export default {
  data () {
    return {
      pageBg1,
      pageBg2,
      pageBg3,
      pageBg4,
      pageBg5,
      pageBg6,
      alertActive: false, // 弹窗显示否
      addimgArr: [], // 图片数据
      toastsh: true, // 提示框显示否
      bottomSheet: false, // 城市选择显示否
      cityArr, // 城市数据
      fromData: {
        serialNo: {val: '', errtxt: '站点号不能为空', valid: true},
        userNo:  {val: '', valid: false},
        phone:  {val: '', errtxt: '请输入联系方式', valid: true},
        province:  {val: '', errtxt: '请输入省份', valid: false},
        district:  {val: '', errtxt: '请输入地区', valid: true},
        remark:  {val: '', errtxt: '请输入站点服务及业绩', valid: true},
        name:  {val: '', errtxt: '请输入站主姓名', valid: true},
        address:  {val: '', errtxt: '请选择所在地址', valid: true},
        url:  {val: '', errtxt: '请添加站点图片', valid: true}
      }
    }
  },
  created () {
    // 页面数据初始化
    this.pageInit()
  },
  methods: {
    // 页面数据并发请求
    pageInit () {
      let that = this,
          _url = `/ushop-api-merchant/api/sns/vote/candidate/signedUp/${that.$xljs.actSession().id}`;
      that.$xljs.ajax(_url, 'get', {}, (data) => {
        // "result":"报名状态(0:未报名 待审:98 不通过:99 通过:100)"，
        if ( data.result === 0 ) {
          // 从未报过名，直接报名就成，不用做任何处理
        } else if ( data.result === 98 ) {
          that.alertActive = 'alert3'; // 提交成功，待审
        } else if ( data.result === 99 ) {
          that.alertActive = 'alert1'; // 不通过
        } else if ( data.result === 100 ) {
          that.alertActive = 'alert2'; // 通过
        }
      });
    },
    // 图片编辑
    img_edit () {
      let that = this;
      that.$xljs.loading( 'show', '图片解析中……' ); // 遮屏
      if ( that.$xljs.isWeixin() ) {//微信选择图片
        let localId = arguments[0];
        window.wx.getLocalImgData({
          localId: localId, // 图片的localID
          success ( res ) {
            that.$xljs.loading( 'hide' ); // 解除遮屏
            // localData是图片的base64数据，可以用img标签显示
            that.$refs.cropper.showcrop( res.localData )
          }
        });
      } else { // 本地用于测试的选择图片
        let e = arguments[0],
            _file = e.target.files[0],
            rf = new FileReader();
        rf.readAsDataURL( _file );
        rf.onload = () => {
          // result是图片的base64数据，可以用img标签显示
          that.$xljs.loading( 'hide' ); // 解除遮屏
          that.$refs.cropper.showcrop( rf.result );
        }
      }
    },
    // 关闭弹窗
    alertBtnClick ( a ) {
      if ( a === 1 ) { // 审核不通过
        this.alertActive = false;
      } else if ( a === 2 ) { // 审核通过
        this.$router.push('/home');
      } else if ( a === 3 ) { // 提交成功，待审
        this.$router.push('/detailsShop?me=1');
      }
    },
    //删除图片
    img_close ( index ) {
      this.addimgArr.splice(index, 1);
    },
    //图片编辑后回调
    cropCb ( data ) {
      this.addimgArr.push(data);
      this.fromData.url.val = data.url;
    },
    // 点击添加图片
    addimgClick () {
      let that = this;
      if ( that.$xljs.isWeixin() ) {//微信选择图片
        that.wxImgB64();
      }else{//本地用于测试的选择图片
        document.getElementById('form_file').click();
      }
    },
    // 微信图片获取
    wxImgB64 () {
      let that = this;
      window.wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success (res) {
           // res.localIds 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
          that.img_edit( res.localIds[0] );
        }
      });
    },
    // 城市选择显示隐藏
    bottomSheetSH ( type ) {
      let that = this;
      if ( type === 'show' ) {
        that.bottomSheet = true;
      } else if ( type === 'hide' ) {
        that.bottomSheet = false;
      }
    },
    cityChange ( val ) {
      let that = this,
          item;
      that.$xljs.each(that.cityArr, ( i, o ) => {
        if ( o.val === val ) {
          item = o;
        }
      });
      that.fromData.district.val = val;
      that.fromData.district.txt = item.txt;
      that.bottomSheet = false;
    },
    // 获取并验证数据
    getValidData () {
      let that = this,
          o = that.fromData,
          me, istrue = true;
      that.$xljs.each(o, ( k, obj ) => {
        if ( !obj.val && obj.valid ) {
          that.$xljs.toast(obj.errtxt);
          istrue = false;
          return false;
        }
      });
      return istrue;
    },
    // 报名未发布100 报名已发布101 投票未发布102 投票已发布103 结束104 下架105
    formSubmit () {
      let that = this,
          _url = '/ushop-api-merchant/api/sns/vote/candidate/signUp',
          _param = {};
      if ( !that.getValidData() ) {
        return false;
      }
      that.$xljs.each(that.fromData, ( k, o ) => {
        _param[k] = o.val;
      });
      _param.electionId = that.$xljs.actSession().id;
      _param.province = '42'; // 固定省份只能是湖北省
      that.$xljs.ajax(_url, 'post', _param, (data) => {
        if ( data.result === 'SUCCESS' ) {
          that.alertActive = 'alert3'; // 提交成功，进入待审中
        } else {
          that.$xljs.toast( (data.error_description || '未知错误') );
        }
      });
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
.form-box-s {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
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
.city-box {
  max-height: 300px;
  overflow-y: auto;
}
</style>
