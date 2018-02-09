var express = require('express');
var router = express.Router();
require("./../util/util")
var User = require('./../models/users')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post("/login", function (req, res, next) {
  var param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd,
  }
  User.findOne(param, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: "账号密码错误"
      });
      console.log("erro")
    } else {
      if (doc) {
        res.cookie("userId", doc.userId, {//存储cookies
          path: '/',
          maxAge: 1000 * 60 * 60
        });
        res.cookie("userName", doc.userName, {
          path: '/',
          maxAge: 1000 * 60 * 60
        });
        //req.session.user = doc;
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      }
    }
  });
});

//登出接口
router.post("/logout", function (req, res, next) {
  res.cookie("userId", "", {//销毁cookies
    path: "/",
    maxAge: -1,
  });
  res.cookie("userName", "", {
    path: "/",
    maxAge: -1,
  });
  res.json({
    status: 0,
    msg: '',
    result: '',
  })
});

//登陆检查
router.get("/checkLogin", function (req, res, next) {
  if (req.cookies.userId) {
    res.json({
      status: '0',
      msg: '',
      result: req.cookies.userName
    })
  } else {
    res.json({
      status: '1',
      msg: '未登录',
      result: ''
    })
  }
});

//查询当前用户的购物车数据
router.get("/cartList", function (req, res, next) {
  var userId = req.cookies.userId;
  User.findOne({userId: userId}, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.cartList,
        })
      }
    }
  })
});


//购物车删除
router.post("/cartDel", function (req, res, next) {
  var userId = req.cookies.userId;
  var productId = req.body.productId;//获取前端的商品ID
  //var productNum = req.body.productNum;//获取前端的商品数量
  User.update({
    userId: userId//条件
  }, {
    $pull: {//更新购物车列表
      'cartList': {'productId': productId}
    }
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        mes: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        mes: '',
        result: 'suc'
      })
    }
  })
});

//更新商品数量
router.post("/cartEdit", function (req, res, next) {
  var userId = req.cookies.userId;//获取cookies中的用户ID
  var productId = req.body.productId;//获取前端的商品ID
  var productNum = req.body.productNum;//获取前端的商品数量
  var checked = req.body.checked;//选中状态
  User.update({"userId": userId, "cartList.productId": productId}, {//更新子文档条件
    "cartList.$.productNum": productNum,//更新商品数量
    "cartList.$.checked": checked,//更新选中状态
  }, function (err, doc) {//回调函数
    if (err) {
      res.json({
        status: '1',
        mes: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        mes: '',
        result: 'suc'
      })
    }
  })
});


router.post("/editCheckAll", function (req, res, next) {
  var userId = req.cookies.userId;//获取cookies中的用户ID
  var checkAll = req.body.checkAll ? '1' : '0';//全选标志位定义
  User.findOne({userId: userId}, function (err, user) {//user用户查询
    if (err) {
      res.json({
        status: '1',
        mes: err.message,
        result: ''
      })
    } else {
      if (user) {//数据库存在此用户
        user.cartList.forEach((item) => {//遍历数据库购物车商品
          item.checked = checkAll;//是否选中状态赋值
        })
        user.save(function (err1, doc) {//存入数据库
          if (err1) {
            res.json({
              status: '1',
              mes: err1.message,
              result: ''
            })
          } else {
            res.json({
              status: '0',
              mes: '',
              result: 'suc'
            })
          }
        })
      }

    }
  })

});

//查询地址信息接口
router.get("/addressList", function (req, res, next) {
  var userId = req.cookies.userId;
  User.findOne({userId: userId}, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: doc.addressList
      })
    }
  })

});


//地址设置默认选项
router.post("/setDefault", function (req, res, next) {
  var userId = req.cookies.userId;
  var addressId = req.body.addressId;
  console.log(addressId);
  if (!addressId) {//是否传入addressId
    res.json({
      status: '1001',
      msg: 'addressId is null',
      result: ''
    })
  } else {
    User.findOne({userId: userId}, function (err, doc) {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      } else {
        var addressList = doc.addressList;//获取addressList
        addressList.forEach((item) => {//遍历addressList
          if (item.addressId == addressId) {//如果
            item.isDefault = true;
          } else {
            item.isDefault = false;
          }
        });
        doc.save(function (err1, doc1) {
          if (err1) {
            res.json({
              status: "1",
              msg: 'err1.message',
              result: ''
            })
          } else {
            res.json({
              status: '0',
              msf: 'isDefault saved',
              result: ''
            })
          }

        })
      }
    })
  }

});

//删除地址接口
router.post("/delAddress", function (req, res, next) {
  var userId = req.cookies.userId, addressId = req.body.addressId;
  User.update({
    userId: userId
  }, {
    $pull: {
      'addressList': {
        'addressId': addressId
      }
    }
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: ''
      })
    }
  })

});

router.post("/payMent", function (req, res, next) {
  var userId = req.cookies.userId,
    addressId = req.body.addressId,
    orderTotal = req.body.orderTotal;
  User.findOne({userId: userId}, function (err, doc) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message,
        result: ''
      });
    } else {
      var address = '', goodsList = [];
      //获取当前用户的地址信息
      doc.addressList.forEach((item) => {
        if (addressId == item.addressId) {
          address = item;
        }
      })
      //获取用户购物车的购买商品
      doc.cartList.filter((item) => {
        if (item.checked == '1') {
          goodsList.push(item);
        }
      });

      var platform = '622';
      var r1 = Math.floor(Math.random() * 10);
      var r2 = Math.floor(Math.random() * 10);

      var sysDate = new Date().Format('yyyyMMddhhmmss');
      var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
      var orderId = platform + r1 + sysDate + r2;
      var order = {
        orderId: orderId,
        orderTotal: orderTotal,
        addressInfo: address,
        goodsList: goodsList,
        orderStatus: '1',
        createDate: createDate
      };

      doc.orderList.push(order);

      doc.save(function (err1, doc1) {
        if (err1) {
          res.json({
            status: "1",
            msg: err1.message,
            result: ''
          });
        } else {
          res.json({
            status: "0",
            msg: '',
            result: {
              orderId: order.orderId,
              orderTotal: order.orderTotal
            }
          });
        }
      });
    }
  })
});

//用户注册

router.post("/regist", function (req, res, next) {
  var userName = req.body.registName;
  var userPwd = req.body.registPwd;

  var platform = '1';
  var r1 = Math.floor(Math.random() * 10);
  var sysDate = new Date().Format('MMddhhmmss');
  var userId = platform + r1 + sysDate;

  //var userId = '10001001';

  User.create({
    userName: userName,
    userPwd: userPwd,
    userId: userId,
  }, function (err, doc) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status: "0",
        msg: '',
        result: '',
      });
    }
  })


});


//根据订单Id查询订单信息
router.get("/orderDetail", function (req, res, next) {
  var userId = req.cookies.userId, orderId = req.param("orderId");
  User.findOne({userId: userId}, function (err, userInfo) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      var orderList = userInfo.orderList;
      if (orderList.length > 0) {
        var orderTotal = 0;
        orderList.forEach((item) => {
          if (item.orderId == orderId) {
            orderTotal = item.orderTotal;
          }
        });
        if (orderTotal > 0) {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: orderId,
              orderTotal: orderTotal
            }
          })
        } else {
          res.json({
            status: '120002',
            msg: '无此订单',
            result: ''
          });
        }
      } else {
        res.json({
          status: '120001',
          msg: '当前用户未创建订单',
          result: ''
        });
      }
    }
  })
});

router.get("/getCartCount", function (req, res, next) {
  if (req.cookies && req.cookies.userId) {
    var userId = req.cookies.userId;
    User.findOne({userId: userId}, function (err, doc) {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        });
      } else {
        var cartList = doc.cartList;
        let cartCount = 0;
        cartList.map(function (item) {
          //获取购物车的全部数量
          cartCount += parseInt(item.productNum);
        });
        res.json({
          status: '0',
          msg: '',
          result: cartCount
        })
      }
    })
  }
});
//添加地址
router.post("/addAddress", function (req, res, next) {
  var phoneNum = req.body.phoneNum;
  var email = req.body.email;
  var userName = req.body.userName;
  var userId = req.cookies.userId;



  var platform = '1';
  var r1 = Math.floor(Math.random() * 10);
  var sysDate = new Date().Format('ddhhmmss');
  var addressId = platform + r1 + sysDate;


  var address = {

    userName: userName,
    addressId:addressId,
    isDefault:false,
    phoneNum: phoneNum,
    email: email,
  };


  User.findOne({userId: userId}, function (err, doc) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message,
        result: ''
      });
    } else {

      doc.addressList.push(address);
      doc.save(function (err1, doc1) {
        if (err1) {
          res.json({
            status: "1",
            msg: err1.message,
            result: ''
          });
        } else {
          res.json({
            status: "0",
            msg: '',
            result: {
              phoneNum: phoneNum,
              email: email,
              userName: userName,
              isDefault:false,
            }
          });
        }
      });

    }
  })

});


module.exports = router;
