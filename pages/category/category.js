var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    // text:"这是一个页面"
    navList: [],
    goodsList: [],
    id: 0,
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    page: 1,
    size: 10000
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    if (options.id) {
      that.setData({
        id: parseInt(options.id)
      });
    }

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });
    //获取购物车商品数量
    var that = this;
    util.request(api.CartGoodsCount).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          cartGoodsCount: res.data.cartTotal.goodsCount
        });

      }
    });

    this.getCategoryInfo();

  },
  getCategoryInfo: function () {
    let that = this;
    util.request(api.GoodsCategory, { id: this.data.id })
      .then(function (res) {

        if (res.errno == 0) {
          that.setData({
            navList: res.data.brotherCategory,
            currentCategory: res.data.currentCategory
          });

          //nav位置
          let currentIndex = 0;
          let navListCount = that.data.navList.length;
          for (let i = 0; i < navListCount; i++) {
            currentIndex += 1;
            if (that.data.navList[i].id == that.data.id) {
              break;
            }
          }
          if (currentIndex > navListCount / 2 && navListCount > 5) {
            that.setData({
              scrollLeft: currentIndex * 60
            });
          }
          that.getGoodsList();

        } else {
          //显示错误信息
        }
      });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    console.log(1);
  },
  onHide: function () {
    // 页面隐藏
  },
  getGoodsList: function () {
    var that = this;

    util.request(api.GoodsList, {categoryId: that.data.id, page: that.data.page, size: that.data.size})
      .then(function (res) {
        that.setData({
          goodsList: res.data.goodsList,
        });
      });
  },
  onUnload: function () {
    // 页面关闭
  },
  switchCate: function (event) {
    if (this.data.id == event.currentTarget.dataset.id) {
      return false;
    }
    var that = this;
    var clientX = event.detail.x;
    var currentTarget = event.currentTarget;
    if (clientX < 60) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft - 60
      });
    } else if (clientX > 330) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft
      });
    }
    this.setData({
      id: event.currentTarget.dataset.id
    });

    this.getCategoryInfo();
  },
  addToCart: function (event) {
    //添加到购物车
    var that = this;
    util.request(api.GoodsDetail, { id: event.target.dataset.id }).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          goods: res.data.info,
          attribute: res.data.attribute,
          specificationList: res.data.specificationList,
          productList: res.data.productList,
        });
        if (res.data.productList.length>1){
          wx.showToast({
            title: '点击商品图片选择商品规格',
          })
        }
        else{
          util.request(api.CartAdd, { goodsId: event.target.dataset.id, number: 1, productId: res.data.productList[0].id }, "POST")
            .then(function (res) {
              let _res = res;
              if (_res.errno == 0) {
                wx.showToast({
                  title: '添加成功',
                  duration:500,
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
  },
	openCartPage: function () {
		wx.switchTab({
			url: '/pages/cart/cart',
		});
	},
})
