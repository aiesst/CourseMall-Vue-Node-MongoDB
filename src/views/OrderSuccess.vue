<template>
  <div>
    <nav-header></nav-header>

    <div class="container">
      <div class="page-title-normal">
        <h2 class="page-title-h2"><span>订单结算</span></h2>
      </div>
      <!-- 进度条 -->
      <div class="check-step">
        <ul>
          <li class="cur"><span>确认</span> 地址</li>
          <li class="cur"><span>订单</span> 支付</li>
          <li class="cur"><span>订单</span> 完成</li>
        </ul>
      </div>

      <div class="order-create">
        <div class="order-create-pic"><img src="/static/ok-2.png" alt=""></div>
        <div class="order-create-main">
          <h3>恭喜您! <br>你的订单正在处理当中!</h3>
          <p>
            <span>订单号：{{orderId}}</span>
            <span>订单总金额：{{orderTotal | currency('￥')}}</span>
          </p>
          <p>
            <span style="color:red">具体交易和疑问请联系店长QQ:332628300</span>
          </p>
          <div class="order-create-btn-wrap">
            <div class="btn-l-wrap">

              <router-link class="btn btn--m" to="/cart">购物车</router-link>
            </div>
            <div class="btn-r-wrap">
              <router-link class="btn btn--m" to="/">主页</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <nav-footer></nav-footer>
  </div>

</template>

<script>
  import NavHeader from './../components/NavHeader'
  import NavFooter from './../components/NavFooter'
  import NavBread from './../components/NavBread'
  import {currency} from './../util/currency'
  import axios from 'axios'
  export default{
    data(){
      return {
        orderId: '',
        orderTotal: 0
      }
    },
    components: {
      NavHeader,
      NavFooter,
      NavBread,

    },
    filters: {
      currency: currency
    },
    mounted(){
      var orderId = this.$route.query.orderId;

      if (!orderId) {
        return;
      }
      axios.get("/users/orderDetail", {
        params: {
          orderId: orderId
        }
      }).then((response) => {
        let res = response.data;
        if (res.status == "0") {
          this.orderId = orderId;
          this.orderTotal = res.result.orderTotal;
        }
      })
    }
  }
</script>
