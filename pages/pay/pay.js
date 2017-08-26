var app = getApp();
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    orderId: 0,
    actualPrice: 0.00,
    items: [
      { value: 0, name: '货到付款(现金)'},

      { value: 1, name: '微信支付'},
    ],
    payType:0,
    orderInfo: {},
    orderGoods: [],
    handleOption: {}
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    console.log(options.order_id)
		var pay_type=this.data.payType;
    this.setData({
      orderId: options.order_id,
    })
  },
  onReady: function () {
    this.getOrderDetail();
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
  getOrderDetail() {
    let that = this;
    util.request(api.OrderDetail, {
      orderId: that.data.orderId
    }).then(function (res) {
      if (res.errno === 0) {
        console.log(res.data);
        that.setData({
          actualPrice: res.data.orderInfo.actual_price,
        });
      }
    });
  },
  radioChange: function (e) {
		this.setData({
      payType: e.detail.value,
    })
		console.log("已选择支付方式："+this.data.items[e.detail.value].name)
  },
  //向服务请求支付参数
  requestPayParam() {
    let that = this;
    util.request(api.PayPrepayId, { orderId: that.data.orderId, payType: that.data.payType  }).then(function (res) {
      if (res.errno === 0) {
				console.log(res);
        let payParam = res.data;
        wx.requestPayment({
          'timeStamp': payParam.timeStamp,
          'nonceStr': payParam.timeStamp,
          'package': payParam.nonceStr,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function (res) {
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=1&order_id='+that.data.orderID,
            })
          },
          'fail': function (res) {
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=0',
            })
          }
        })
      }else{
        console.log(res);
      }
    });
  },
  startPay() {
		let that = this;
		if (that.data.payType>=1){
    	this.requestPayParam();
		}else{
			//发送订单通知
			util.request(api.NotifyShop, { orderId: that.data.orderId, payType: that.data.payType  }).then(function (res) {
	      if (res.errno === 0) {
					console.log(res);
	      }else{
	        console.log(res);
	      }
	    });
			wx.redirectTo({
				url: '/pages/payResult/payResult?status=2&order_id='+that.data.orderID,
			})
		}
  }
})
