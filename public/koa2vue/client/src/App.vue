<template>
  <div id="app">
    <transition :name="appani">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import appinit from './assets/appinit'
export default {
  name: 'app',
  computed: {
    appani () {
      return this.$store.state.appani
    }
  },
  created () {
    appinit.call(this)
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(100%, 0);
}

.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-100% 0);
}
</style>
