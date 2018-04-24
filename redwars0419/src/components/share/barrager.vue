<template>
  <canvas ref="canvasme">你的浏览器不支持canvas</canvas>
</template>
<script>
export default {
  props: {
    para: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      msgs: new Array(300), //缓冲池，长度越大，屏幕上显示的就越多
      intv: 20, // 重绘的时间，ms
      nexts: 3000, // 下一条出现的时间，ms
      width: 640,
      font: '30px 黑体',
      colorArr: ['Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip', 'PeachPuff', 'Peru', 'Pink', 'Plum', 'PowderBlue', 'Purple', 'Red', 'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 'SeaShell', 'Sienna', 'Silver', 'SkyBlue'],
      interval: ''
    }
  },
  mounted () {
    this.canvas = this.$refs.canvasme
    this.ctx = this.canvas.getContext('2d')
    this.height = this.canvas.offsetHeight*this.width/this.canvas.offsetWidth
    //canvas分辨率
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx.font = this.font
    this.init()
  },
  methods: {
    draw () { //绘制方法
      let _this = this
      if (_this.interval != '') return
      _this.interval = setInterval(() => { //每隔20毫秒重新绘制一次，间隔最好小于40，要不然效果就跟播放图片差不多
        //1，清除屏幕
        _this.ctx.clearRect(0, 0, _this.width, _this.height)
        _this.ctx.save()
        let lgn = _this.msgs.length,
            i = 0
        //2，循环缓冲区域，把没有设置Left，Top，Speed，Color先赋值，赋值的就改变left值（产生移动效果），left值小于200就会从缓冲区移除
        for ( ; i < lgn; i++ ) {
          if ( _this.msgs[i] ) {
            if ( _this.msgs[i].L ) {
              if (_this.msgs[i].L < -500) {
                _this.msgs[i] = null
              } else {
                _this.msgs[i].L = parseInt(_this.msgs[i].L - _this.msgs[i].S)
                _this.ctx.fillStyle = _this.msgs[i].C
                _this.ctx.fillText(_this.msgs[i].msg, _this.msgs[i].L, _this.msgs[i].T)
                _this.ctx.restore()
              }
            } else {
              _this.msgs[i].L = _this.width //显示的位置
              _this.msgs[i].T = parseInt(Math.random() * (_this.height - 30) + 30) // 容器范围内出现
              _this.msgs[i].S = parseInt(Math.random() * (5 - 1) + 1) //速度
              _this.msgs[i].C = _this.colorArr[Math.floor(Math.random() * _this.colorArr.length)] //颜色
            }
          }
        }

        // 循环播放随机内容
        _this.num = (_this.num ? (_this.num + _this.intv) : _this.intv)
        if (_this.num > _this.nexts) {
          _this.num = 0
          _this.putMsg([{
            'msg': _this.gettxt()
          }])
        }
      }, _this.intv)
    },
    // 添加数据，数据格式[{'msg':'nihao'}]
    putMsg (datas) { // 循环缓冲区，把位置是空的装填上数据
      let j = 0,
          i = 0,
          lgn = datas.length,
          mlgn = this.msgs.length
      for ( ; j < lgn; j++ ) {
        for ( i = 0; i < mlgn; i++ ) {
          if ( !this.msgs[i] ) {
            this.msgs[i] = datas[j]
            break
          }
        }
      }
      this.draw()
    },
    clear () { //清除定时器，清除屏幕，清空缓冲区
      let i = 0,
          lgn = this.msgs.length
      clearInterval(this.interval)
      this.interval = ''
      this.ctx.clearRect(0, 0, this.width, this.height)
      this.ctx.save()
      for ( ; i < lgn; i++ ) {
        this.msgs[i] = null
      }
    },
    gettxt () {
      if ( this.para && this.para[0] ) {
        return this.para[parseInt(Math.random() * this.para.length)].msg
      }
      return ''
    },
    init () {
      this.putMsg([{
        'msg': this.gettxt()
      }])
    }
  }
}
</script>

<style scoped>
canvas {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,.6);
}
</style>

