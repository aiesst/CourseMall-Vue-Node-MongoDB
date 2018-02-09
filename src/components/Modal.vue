<template>
  <div>

    <div class="  md-modal modal-msg md-modal-transition" v-bind:class="{'md-show':mdShow}">
      <div class="md-modal-inner">
        <div class="md-top">
          <P>
            <button class="md-close" @click="closeModal">关闭</button>
          </P>

        </div>
        <div class="md-content">
          <div class="confirm-tips">
            <slot name="message"></slot>
          </div>
          <div class="confirm-tips">
            <slot name="btnGroup"></slot>
          </div>
        </div>
      </div>
    </div>
    <div class="md-overlay" v-if="mdShow" @click="closeModal" ></div>

  </div>
</template>

<script>
  export default{
    props: ["mdShow"],//向子组件传递参数
    data(){
      return {
        msg: 'hello vue'
      }
    },
    methods:{
      closeModal()
      {
          this.$emit("close");//触发父组件的close事件
      }
    }

  }
</script>
