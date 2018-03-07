<template>
  <div class="crop-box" v-show="show">
    <div class="crop-img" id="image-box"></div>
    <div class="crop-foot">
      <button @click="closecrop">确定</button>
    </div>
  </div>
</template>

<script>
import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';
import p200200 from '@/assets/image/p200200.png';

export default {
  data () {
    return {
      show: false,
      cropperobj: null,
      imgobj: null,
      imgbox: null
    }
  },
  methods: {
    showcrop ( src ) {
      let that = this;
      that.show = true;
      let imgbox = document.getElementById('image-box'),
          imgobj = new Image();
      //元素赋值记录
      that.imgbox = imgbox;
      that.imgobj = imgobj;
      imgobj.src = src || p200200;
      imgbox.appendChild(imgobj);
      imgobj.onload = function () {
        that.cropperobj = new Cropper(imgobj, {
          autoCropArea: .8, //裁切框大小，0-1，现对于总的图片大小
          aspectRatio: 16/9 //裁切框比例
        });
      }
    },
    closecrop () {
      //cropper.getCroppedCanvas().toDataURL('image/jpeg')
      //cropper.getCroppedCanvas().toBlob(function (blob) {})
      let that = this,
          canvasele = that.cropperobj.getCroppedCanvas(),
          bs64 = canvasele.toDataURL('image/jpeg'),
          _param =  [{
                      name: '0.jpg',
                      content: (bs64.indexOf(',') > 0 ? bs64.split(',')[1] : bs64),
                      thumb: 1
                    }],
          _url = '/ushop-api-merchant/api/sns/file/submit';
      that.$xljs.ajax(_url, 'post', JSON.stringify(_param), function(data){
        data.bs64 = bs64;
        that.show = false;
        that.cropperobj.destroy();
        that.imgbox.removeChild(that.imgobj);
        that.$parent.cropCb( data );
      });
    }
  }
}
</script>

<style scoped>
.crop-box {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: #fff;
  z-index: 1000000;
  overflow: hidden;
}
.crop-img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 80%;
  overflow: hidden;
}
.crop-img img {
  max-width: 100%;
}
.crop-foot {
  position: absolute;
  left: 0;
  top: 80%;
  width: 100%;
  height: 20%;
}
</style>
