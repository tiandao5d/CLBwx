<template>
  <div id="app">
    <div class="preview-content">
      <vue-list :list.sync='list' :dispatchData="setData"></vue-list>
    </div>
  </div>
</template>

<script>
import vueList from 'components/vue-list';

window.COUNT = 1;

export default {
  name: 'app',
  data() {
    return {
      list: [],
      data: {}
    }
  },
  created() {
    for(var i = 0; i < 200; i++) {
      this.list.push({
        title: 'item ' + COUNT++
      });
    }
  },
  methods: {
    setData(data) {
      this.data = data;
    }
  },
  components: {
    vueList
  }
}
</script>
<style>
.preview-content {
  box-sizing: border-box;
  width: 100%;
  height: 464px;
  position: absolute;
  left: 0;
  top: 0;
  background: #fff;
  overflow-y: scroll;
  border: solid 1px #f00;
}
</style>
