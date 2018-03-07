<template>
  <div class="banner-box comp-box">
    <div class="swiper-comps" v-if="listtrue">
      <div class="swiper-cons">
        <swiper :options="bannerOptions">
          <swiper-slide v-for="img, index in list" :key="index"><img class="swiper-img" :src="img"/></swiper-slide>
          <div class="swiper-pagination"  slot="pagination"></div>
        </swiper>
      </div>
    </div>
    <div v-else><img width="100%" :src="bannerDimg"></div>
  </div>
</template>

<script>
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
      bannerOptions: {
        loop: true,
        autoplay: {
          delay: 5000,
          stopOnLastSlide: false,
          disableOnInteraction: false
        },
        pagination: {
          el: '.swiper-pagination'
        },
        on: {
          tap ( e ) {
            console.log( e )
          }
        }
      }
    }
  },
  computed: {
    listtrue () {
      return (this.list && this.list.length > 0)
    }
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
