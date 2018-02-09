<template>
  <div><!--copy静态元素的时候，必须要有一个根元素-->
    <!--h5不支持大写，中间大写字母转化成'-'.-->
    <nav-header></nav-header>
    <!--nav-bread>
      <span slot="bread"></span>
    </nav-bread-->
    <div class="accessory-result-page accessory-page">
      <div class="container">
        <div class="filter-nav" style="height: 100%;padding: 0 0px!important;    border-radius: 8px;box-shadow: 0 12px 24px 0 rgba(7,17,27,.2);margin-top:16px"  >
          <img src="http://gytblog.oss-cn-shenzhen.aliyuncs.com/mall/title-1.png" style="width:100%;height:50%;display:block; ">

        </div>

        <div class="filter-nav" style="border-radius: 8px;box-shadow: 0 6px 12px 0 rgba(7,17,27,.2);">
          <span class="sortby">方式:</span>
          <a href="javascript:void(0)" class="default cur">默认排序</a>
          <a href="javascript:void(0)" class="price" v-bind:class="{'sort-up':sortFlag}" @click="sortGoods()">价格排序
            <svg class="icon icon-arrow-short">
              <use xlink:href="#icon-arrow-short"></use>
            </svg>
          </a>
          <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">价格过滤</a>
        </div>
        <div class="accessory-result">
          <!-- filter -->
          <div class="filter stopPop" id="filter" :class="{'filterby-show':filterBy}">
            <dl class="filter-price">
              <dt>价格:</dt>
              <dd><a href="javascript:void(0)" :class="{'cur':priceChecked=='all'}"
                     @click="setPriceFilter('all')">所有</a></dd>
              <dd v-for="(price,index) in priceFilter">
                <a href="javascript:void(0)" :class="{'cur':priceChecked==index}" @click="setPriceFilter(index)">{{price.startPrice}}
                  - {{price.endPrice}}</a>
              </dd>
            </dl>
          </div>

          <!-- search result accessories list -->
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4">
              <ul>
                <li v-for="(item,index) in goodsList">
                  <div class="pic">
                    <!--v-bind 防止未渲染到图片-->
                    <a href="#"><img v-lazy="item.productImage" alt="" style="border-radius: 6px;"></a>
                  </div>
                  <div class="main">
                    <div class="name">{{item.productName}}</div>
                    <div class="price">{{item.salePrice | currency('￥')}}</div>
                    <div class="btn-area">
                      <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                    </div>
                  </div>
                </li>
              </ul>
              <div class="view-more-normal" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy"
                   infinite-scroll-distance="30">
                <img src="../assets/loading-spinning-bubbles.svg" v-show="loading">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>
    <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
      <p slot="message">请登陆</p>
      <div slot="btnGroup"><a class="btn btn--m btn-close-1" href="javascript:;" @click="mdShow=false" >关闭</a></div>
    </modal>

    <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
      <p slot="message">
        <svg class="icon-status-ok">
          <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
        </svg>
        <span>加入购物车成!</span>
      </p>
      <div slot="btnGroup">
        <a class="btn btn--m" href="javascript:;" @click="mdShowCart = false">继续购物</a>
        <router-link class="btn btn--m btn--red" href="javascript:;" to="/cart">查看购物车</router-link>
      </div>
    </modal>
    <nav-footer></nav-footer>

  </div>
</template>
<style>
  .btn:hover {
    background-color: #ffe5e6;
    transition: all .3s ease-out;
  }
</style>
<script>
  //总结：
  //1.静态页面的组件划分
  //2.header footer 面包屑
  //3.组件的导入及书写规范


  import './../assets/css/base.css'
  import './../assets/css/product.css'
  import './../assets/css/login.css'

  import NavHeader from './../components/NavHeader'
  import NavFooter from './../components/NavFooter'
  import NavBread from './../components/NavBread'
  import Modal from './../components/Modal'
  import {currency} from './../util/currency'


  import axios from 'axios'

  export default{

    data(){
      return {//返回一个object
        goodsList: [],

        priceFilter: [
          {
            startPrice: '0.00',
            endPrice: '20.00',
          },
          {
            startPrice: '20.00',
            endPrice: '50.00',
          },
          {
            startPrice: '50.00',
            endPrice: '100.00'
          },
          {
            startPrice: '100.00',
            endPrice: '150.00'
          },

        ],
        priceChecked: 'all',   // 选中的价格区间
        filterBy: false,     // 控制价格菜单的显示
        overLayFlag: false,   // 遮罩的显示
        sortFlag: true,     // 排序:默认升序
        page: 1,            // 当前第一页
        pageSize: 12,         // 一页有8条数据
        busy: true,    // 滚动加载插件默认禁用
        loading: false,
        mdShow: false,
        mdShowCart: false
      }
    },
    components: {
      NavHeader,
      NavFooter,
      NavBread,
      Modal,

    },
    mounted: function () {
      this.getGoodsList();//初始化调用函数

    },
    filters:{
      currency:currency
    },
    methods: {
      getGoodsList(flag){
        let param = {
          page: this.page,
          pageSize: this.pageSize,
          sort: this.sortFlag ? 1 : -1,
          priceLevel: this.priceChecked,
        };
        this.loading = true;

        axios.get("/goods/list", {
          params: param,    //传参到服务端
        }).then((result) => {//从/goods路由获取json数据
          var res = result.data;
          this.loading = false;
          if (res.status == '0') {
            if (flag) {
              this.goodsList = this.goodsList.concat(res.result.list);//讲json数据扔给goodList
              if (res.result.count == 0) {
                this.busy = true;
              } else {
                this.busy = false;
              }
            } else {
              this.goodsList = res.result.list;
              this.busy = false;
            }


          } else {
            this.goodsList = [];
          }


        })

      },
      showFilterPop(){
        this.filterBy = true;
        this.overLayFlag = true;
      },
      closePop(){
        this.filterBy = false;
        this.overLayFlag = false;

      },
      sortGoods(){
        this.sortFlag = !this.sortFlag;
        this.page = 1;
        this.getGoodsList();//重新加载

      },
      setPriceFilter(index){   // 点击价格
        this.priceChecked = index;
        this.closePop();
        this.page = 1;
        this.getGoodsList();
      },
      loadMore(){   // 滚动加载插件方法
        this.busy = true; // 滚动就禁用，防止下一个滚动
        setTimeout(() => {   // 一个滚动完成之后再滚动加载下一个
          this.page++;
          this.getGoodsList(true);  // 滚动加载是累加数据，并不是只显示一页数据，so需要传参去请求数据的地方判断一下
        }, 500);
      },
      addCart(productId){  // 点击加入购物车
        axios.post("/goods/addCart", {
          productId: productId
        }).then((res) => {
          var res = res.data;
          if (res.status == 0) {
            this.mdShowCart = true;
            this.$store.commit("updateCartCount",1);
          } else {
            this.mdShow = true;
          }
        })
      },
      closeModal(){
        this.mdShow = false;
        this.mdShowCart = false;

      }
    }
  }
</script>
