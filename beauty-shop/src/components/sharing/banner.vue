<template>
  <div class="banner-box comp-box">
    <div class="swiper-comps" v-if="list.length > 0">
      <div class="swiper-cons">
        <swiper :options="bannerOptions">
          <swiper-slide v-for="item, index in list" :key="index">
            <a :href="item.key"><img class="swiper-img" :src="item.value"/></a>
          </swiper-slide>
          <div class="swiper-pagination"  slot="pagination"></div>
        </swiper>
      </div>
    </div>
    <div v-else><img width="100%" :src="bannerDimg"></div>
  </div>
</template>

<script>
import 'swiper/dist/css/swiper.css'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import img from '@/assets/image/p300100.png'
export default {
  props: {
    list: {
      type: Array,
      required: true,
      default: []
    }
  },
  data () {
    return {
      bannerDimg: img,
      bannerOptions: this.getSOption()
    }
  },
  methods: {
    getSOption () {
      let that = this;
      return {
        loop: true,
        autoplay: {
          delay: 5000,
          stopOnLastSlide: false,
          disableOnInteraction: false
        },
        pagination: {
          el: '.swiper-pagination'
        }
      }
    }
  },
  components: {
    swiper,
    swiperSlide
  }
}
</script>

<style scope>
.swiper-comps {
  position: relative;
  width: 100%;
  padding-top: 33.3333%;
  overflow: hidden;
}

.swiper-cons {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.swiper-container {
  height: 100%;
}

.swiper-img {
  width: 100%;
}

.swiper-container-horizontal>.swiper-pagination-bullets {
  bottom: 0;
  text-align: right;
  padding: 0 15px;
}
</style>
