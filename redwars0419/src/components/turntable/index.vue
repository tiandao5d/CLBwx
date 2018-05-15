<template>
  <div class="page-item">
    <xl-turn />
    <xl-answer />
  </div>
</template>

<script>
import XlTurn from '@/components/share/turntable.vue'
import XlAnswer from '@/components/answer'

export default {
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
  },
  components: {
    XlTurn,
    XlAnswer
  }
}
</script>

<style scoped>
.page-item {
  position: relative;
  max-width: 720px;
  margin: 0 auto;
}
</style>
