<template>
  <div class="aniitem-box" ref="anibox"></div>
</template>
<script>
import himg from '@/assets/images/p200200.png'


function BarragerTi(ele, para) {
  this.box = ele
  this.para = para
  this.cunnum = 0
  this.nexts = 3000 // 下一条出现的时间，ms
  this.itemw = 200 // 元素最大宽度
  this.width = this.box.offsetWidth // 容器宽度
  this.height = this.box.offsetHeight // 容器高度
  this.msgs = new Array((this.para.length > 5 ? 5 : this.para.length)) // 缓冲池，长度越大，屏幕上显示的就越多
  this.intv = 20 // 重绘时间
  this.interval = ''
  this.draw = function() {
    if (this.interval != '') return
    this.interval = setInterval(() => {
      let i = 0,
        lgn = this.msgs.length,
        el = null
      for (i = 0; i < lgn; i++) {
        el = this.msgs[i]
        if (el) {
          if (el.$l < -this.itemw) { // 超出容器范围删除
            this.box.removeChild(el)
            this.msgs[i] = null
          } else { // 未超出容器范围继续
            el.$l = parseInt(el.$l - el.$s)
            el.style.left = (el.$l + 'px')
          }
        }
      }
      this.num = (this.num ? (this.num + this.intv) : this.intv)
      if (this.num > this.nexts) {
        this.num = 0
        this.pushMsg(this.getObj())
      }
    }, this.intv)
  }
  this.pushMsg = function(obj) {
    let i = 0,
      lgn = this.msgs.length,
      el
    for (i = 0; i < lgn; i++) {
      if (!this.msgs[i]) {
        el = this.getDiv(obj)
        el.$l = this.width //显示的位置
        el.$s = parseInt(Math.random() * (3 - 1) + 1) // 速度
        el.style.left = (el.$l + 'px')
        this.msgs[i] = el
        this.box.appendChild(el)
        break
      }
    }
  }
  this.getObj = function () {
    if ( this.cunnum >= 0 ) {
      if ( this.cunnum >= this.para.length ) {
        this.cunnum = 0
      }
      return this.para[this.cunnum]
    }
    return this.para[parseInt(Math.random() * this.para.length)]
  }
  this.getDiv = function(obj) {
    let div = document.createElement('div'),
      str = `<div class="tibarrager-txt">${obj.txt}<\/div><img class="tibarrager-img" src="${obj.img}" \/>`
    div.className = 'tibarrager-box'
    div.style.top = (parseInt(Math.random() * (this.height - 14) + 14) + 'px') // 容器范围内出现
    div.innerHTML = str
    return div
  }
  this.init = function() {
    this.draw()
    this.pushMsg(this.getObj())
  }
}
export default {
  data() {
    return {
      isshow: false,
      himg
    }
  },
  mounted() {
    // 弹幕数据
    // let a = [{
    //   msg: 'werer'
    // }, {
    //   msg: '中国人'
    // }, {
    //   msg: '对方水电费对方水电费对方水电费对方水电费'
    // }, {
    //   msg: 'dsfsd订单'
    // }]
    // let arr = a && a[0] ? [...a] : null
    let arr = this.$xljs.winprizearr && this.$xljs.winprizearr[0] ? [...this.$xljs.winprizearr] : null
    if (arr) {
      this.isshow = true
      this.$xljs.each(arr, (index, obj) => {
        obj.txt = obj.msg || '错误文字'
        obj.img = obj.img || himg
      })
      var api = new BarragerTi(this.$refs.anibox, arr)
      api.init()
    }
  }
}

</script>
<style>
.aniitem-box {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.tibarrager-box {
  position: absolute;
  font-size: 14px;
}
.tibarrager-txt {
  max-width: 150px;
  border-radius: 50px;
  line-height: 2;
  background-color: rgba(0, 0, 0, .7);
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 1.5em 0 2em;
}
.tibarrager-img {
  position: absolute;
  left: -1.5em;
  top: -.5em;
  width: 3em;
  height: 3em;
  line-height: 1;
  vertical-align: top;
  border-radius: 50%;
}

</style>
