<template>
  <div class="page-item">
    <img class="w100" :src="tte011">
    <transition leave-active-class="animated fadeOut" :enter-active-class="'animated ' + anis">
      <div class="list-item" :key="itemshow" v-if="cunitem">
        <div class="list-title"><span :style="{'background-image': ('url(' + tte012 + ')')}">{{'第' + chnum[itemshow] + '题'}}</span></div>
        <div class="list-txt1">{{cunitem.question}}</div>
        <div @click="answerFn($event, aobj.istrue, cunitem.id)" :class="('list-btn list-btn' + index)" v-for="aobj, index in cunitem.answer">{{ennum[index] + '、' + aobj.txt}}</div>
      </div>
    </transition>
    <div class="done-img" v-if="isdone > 0">
      <img class="w100" :src="doneimg[isdone]">
      <div class="done-btn" @click="answerReset" v-if="isdone === 2"></div>
    </div>
  </div>
</template>

<script>
import 'animate.css'

import tte011 from '@/assets/images/tte011.jpg'
import tte012 from '@/assets/images/tte012.png'
import tte013 from '@/assets/images/tte013.jpg'
import tte014 from '@/assets/images/tte014.jpg'

export default {
  data () {
    return {
      itemall: 4, // 总共需要回答多少题
      itemshow: 0, // 内容显示哪一个
      disablebtn: false, // 是否禁用点击答题
      rightIds: [], // 正确的ID
      wrongIds: [], // 错误的ID
      doneimg: ['', tte014, tte013], // 图片显示
      isdone: 0, // 答题完成后是对是错，1为错，2为对
      anis: 'tada', // 动效
      chnum: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
      ennum: ['A', 'B', 'C', 'D'],
      dataarr: [{
        "id": 1001,
        "question": "3D彩票知识问答1",
        "answer": [{"txt": "aa1", "istrue": false}, {"txt": "bb1", "istrue": true}, {"txt": "cc1", "istrue": false}, {"txt": "dd1", "istrue": false}],
        "image": "http"
      }, {
        "id": 1002,
        "question": "3D彩票知识问答2",
        "answer": [{"txt": "aa2", "istrue": false}, {"txt": "bb2", "istrue": false}, {"txt": "cc2", "istrue": true}, {"txt": "dd2", "istrue": false}],
        "image": "http"
      }, {
        "id": 1003,
        "question": "3D彩票知识问答3",
        "answer": [{"txt": "aa3", "istrue": false}, {"txt": "bb3", "istrue": false}, {"txt": "cc3", "istrue": true}, {"txt": "dd3", "istrue": false}],
        "image": "http"
      }, {
        "id": 1004,
        "question": "3D彩票知识问答4",
        "answer": [{"txt": "aa4", "istrue": false}, {"txt": "bb4", "istrue": false}, {"txt": "cc4", "istrue": true}, {"txt": "dd4", "istrue": false}],
        "image": "http"
      }], // 列表内容数组
      anisarr: ['bounceIn','bounceInDown','bounceInLeft','bounceInRight','bounceInUp','fadeIn','fadeInDown','fadeInDownBig','fadeInLeft','fadeInLeftBig','fadeInRight','fadeInRightBig','fadeInUp','fadeInUpBig','flipInX','flipInY','lightSpeedIn','rotateIn','rotateInDownLeft','rotateInDownRight','rotateInUpLeft','rotateInUpRight','slideInUp','slideInDown','slideInLeft','slideInRight','zoomIn','zoomInDown','zoomInLeft','zoomInRight','zoomInUp','jackInTheBox','rollIn'], // 可用特效
      tte011,
      tte012,
      cunitem: null // 当前显示的问题
    }
  },
  mounted () {
    this.answerReset() // 重置抽奖
  },
  methods: {
    // 获取动效
    getAnis () {
      let ns = this.anisarr[parseInt(Math.random()*this.anisarr.length)]
      if ( ns && !(ns === this.anis) ) {
        this.anis = ns
      } else {
        this.getAnis()
      }
    },
    // 获取问题对象
    getQtion () {
      let obj = this.dataarr[parseInt(Math.random()*this.dataarr.length)],
          arr = [],
          ids = [...this.rightIds, ...this.wrongIds]
      if ( ids.indexOf(obj.id) >= 0 ) {
        return this.getQtion()
      } else {
        return obj
      }
    },
    // 答题重置
    answerReset () {
      this.itemshow = 0 // 内容显示哪一个
      this.rightIds = [] // 正确的ID
      this.wrongIds = [] // 错误的ID
      this.itemall = 4 // 总共需要回答多少题
      this.isdone = 0 // 答题完成后是对是错，1为错，2为对
      this.disablebtn = false // 可以答题
      this.cunitem = this.getQtion() // 首次显示的题目
    },
    // 判断答题，进入下一题
    answerFn ( e, istrue, id ) {
      if ( !this.disablebtn ) {
        this.disablebtn = true; // 不能点击
        if ( istrue ) { // 回答正确了
          this.rightIds.push(id) // 存入正确的题目ID
          e.target.classList.add('success')
        } else { // 回答错误了
          this.wrongIds.push(id) // 存入错误的题目ID
          e.target.classList.add('error')
        }
        // 倒计时跳转下一题
        this.getAnis() // 重置动效
        setTimeout( () => {
          // 进入下一题
          if ( ( this.itemshow + 1 ) < this.itemall ) {
            this.disablebtn = false; // 不能点击
            this.itemshow++
            this.cunitem = this.getQtion()
          } else if ( ( this.itemshow + 1 ) >= this.itemall ) {
            // 答题完成
            this.answerDone()
          }
        }, 500);
      }
    },
    // 答题完成后执行
    answerDone () {
      if ( this.rightIds.length >= this.itemall*0.5 ) { // 答题成功
        this.isdone = 1
        setTimeout(() => {
          this.$router.push('/turntable')
        }, 2000)
      } else { // 答题失败
        this.isdone = 2
      }
    }
  }
}
</script>

<style scoped>
.page-item {
  position: relative;
  max-width: 720px;
  margin: 0 auto;
}
.list-item {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.list-title {
  position: absolute;
  top: 9%;
  left: 0;
  width: 100%;
  text-align: center;
}
.list-title span {
  display: inline-block;
  font-size: 16px;
  padding: 0 1.5em;
  background-size: 100% 100%;
  line-height: 1.6;
  color: #fff;
}
.list-txt1 {
  position: absolute;
  top: 15%;
  bottom: 66%;
  left: 0;
  width: 100%;
  padding: 0 16%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
.list-btn {
  position: absolute;
  left: 30%;
  right: 30%;
  background: none;
  border: 0;
  color: #fff;
  text-shadow: 0 1px #000;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
}
.list-btn.error {
  color: #ff001b;
}
.list-btn.success {
  color: #16ba00;
}
.list-btn0 {
  top: 60.6%;
  bottom: 34.1%;
}
.list-btn1 {
  top: 70.1%;
  bottom: 24.6%;
}
.list-btn2 {
  top: 79.7%;
  bottom: 15.1%;
}
.list-btn3 {
  top: 89%;
  bottom: 5.7%;
}
.done-img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
}
.done-btn {
  position: absolute;
  top: 82.8%;
  bottom: 11.2%;
  left: 34.8%;
  right: 34.3%;
}
.done-btn:active {
  background-color: rgba(0,0,0,.2);
}
.w100 {
  width: 100%;
}
.wh11 {
  width: 100%;
  height: 100%;
}
</style>
