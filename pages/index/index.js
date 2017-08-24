const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');

//获取应用实例
const app = getApp()
Page({
  data: {
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    floorGoods: [],
    banner: [],
    channel: [],
    goodsCount: 0,

  },
  onShareAppMessage: function () {
    return {
      title: 'NideShop',
      desc: '仿网易严选微信小程序商城',
      path: '/pages/index/index'
    }
  },

  getIndexData: function () {
    let that = this;
    util.request(api.IndexUrl).then(function (res) {
      if (res.errno === 0) {
        console.log(res);
        that.setData({
          newGoods: res.data.newGoodsList,
          hotGoods: res.data.hotGoodsList,
          topics: res.data.topicList,
          brand: res.data.brandList,
          floorGoods: res.data.categoryList,
          banner: res.data.banner,
          channel: res.data.channel
        });
      }else{
        console.log(res);
      }
    });
  },
  onLoad: function (options) {
    this.getIndexData();
  },
  onReady: function () {
    // 页面渲染完成
    let that=this;
    util.request(api.GoodsCount).then(function (res) {
      that.setData({
        goodsCount: res.data.goodsCount
      });
      console.log(res.data.goodsCount)
    });
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  addToCart: function (event) {
    var that = this;
    util.request(api.GoodsDetail, { id: event.target.dataset.id }).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          goods: res.data.info,
          attribute: res.data.attribute,
          specificationList: res.data.specificationList,
          productList: res.data.productList,
        });
        if (res.data.productList.length > 1) {
          wx.showToast({
            title: '点击商品图片选择商品规格',
          })
        }
        else {
          util.request(api.CartAdd, { goodsId: event.target.dataset.id, number: 1, productId: res.data.productList[0].id }, "POST")
            .then(function (res) {
              let _res = res;
              if (_res.errno == 0) {
                wx.showToast({
                  title: '添加成功',
                  duration:500
                });
                that.setData({
                  cartGoodsCount: _res.data.cartTotal.goodsCount
                });
              } else {
                wx.showToast({
                  image: '/static/images/icon_error.png',
                  title: _res.errmsg,
                  mask: true
                });
              }

            });
        }
      }
    });
    console.log(event.target.dataset.id)
    //添加到购物车
  },
})
