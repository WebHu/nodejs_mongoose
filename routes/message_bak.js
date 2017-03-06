/**
 * fileName:message.js
 * author:gamehu
 * date:2017/3/3 13:56
 * desc:message queue 实例
 */
var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
//注：post请求获取参数需要
var bodyParser = require("body-parser");
const Mq = mongoose.model('messageQueue');
//access_token验证
var access_token = require('./token');


var http = require("http");
var https = require("https");
//设置响应内容
var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

var jsonParser = bodyParser.json();
//中间件用于校验提交的数据
/*router.use('/', jsonParser, function (req, res, next) {
 console.log('...............'+req.body.clientReference);
 //校验
 var clientReference = req.body.clientReference;
 if (!clientReference) {
 sendJSONresponse(res, 400, {
 "message": "非法用户..clientReference"
 });
 return;
 } else {
 //不能省略不然挂起..
 next();
 }

 });*/

//中间件用于校验提交的数据
function validateData(req, res, next) {
    var p = new Promise(function (resolve, reject) {
        //校验
        var clientReference = req.body.clientReference;
        if (!clientReference) {
            resolve(0);
        } else {
            resolve(1);
        }

    });
    return p;
}
//中间件用于校验用户token
router.use('/', jsonParser, function (req, res, next) {
    next();

});


//添加消息到队列
router.put('/putMq', jsonParser, function (req, res, next) {
    //使用promise同步执行,Promise.try类似try
    Promise.try(validateData(req, res, next).then(function (data) {
        if (data === 1) {
            //数据校验通过后执行用户身份认证
            return access_token.accessToken("https://id.shipxy.com/core/connect/accesstokenvalidation", "1eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImEzck1VZ01Gdjl0UGNsTGE2eUYzekFrZnF1RSIsImtpZCI6ImEzck1VZ01Gdjl0UGNsTGE2eUYzekFrZnF1RSJ9.eyJpc3MiOiJodHRwczovL2lkLnNoaXB4eS5jb20vY29yZSIsImF1ZCI6Imh0dHBzOi8vaWQuc2hpcHh5LmNvbS9jb3JlL3Jlc291cmNlcyIsImV4cCI6MTQ4ODc3MjMzMywibmJmIjoxNDg4NzY4NzMzLCJjbGllbnRfaWQiOiJkZW1vaWQiLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIl0sInN1YiI6Ijk2YWU5MTQzZDJjNzBlMDkiLCJhdXRoX3RpbWUiOjE0ODg3NjM1MDcsImlkcCI6Imlkc3J2IiwiYW1yIjpbInBhc3N3b3JkIl19.jzbm6vVgzLPhSQ_nFgD9E_HGYwgZgFK-MfdYvTWD8Clb619m1pB8DkWnYkLXj2hvAB5i8O7r_Q21Qc3bColgWLPpp7T5_d-dRN_plE1uS3o7qXjcBXOpg1JCVBCdFtXXAgaBrgFdFa8GTgrsSK9nLa8-cS6SWKw5CPMK_pPxN9UR6Y132mHGc0cXNNIkSxxCQdtqkedZIUg-0e9GIAlUpcSz1rtlcUXoMYkxnosP1OSEOtOas7T3DXS46KMLRoShaPOwegPugCmmO_3pCxyoT4gAbqglF_Lqq09q96Oq_e9L7ewN8fDWI_l5m7ifEhlzM-pwn5lEcfodXhwuXQK92Q");
        } else {
            sendJSONresponse(res, 200, {
                "message": "数据校验未通过.."
            });
        }
    }).then(function (data) {
        console.log('...............token:' + data.Message);
        if (data.Message) {
            sendJSONresponse(res, 200, {
                "message": "令牌失效.."
            });
        } else {
            if (data.iss) {
                //身份验证通过
                console.log("putMq..." + data.iss+","+req.body.clientReference);
                Mq.create({
                    clientReference: req.body.clientReference,
                    fromTenantId: req.body.fromTenantId,
                    toTenantId: req.body.toTenantId,
                    fromPlatformId: req.body.fromPlatformId,
                    toPlatformId: req.body.toPlatformId,
                    payload: req.body.payload
                }, function (err, node, num) {
                    if (err) {
                        sendJSONresponse(res, 500, {"message": "发送失败.."});
                    } else {
                        sendJSONresponse(res, 200, node);
                    }
                })
            }
        }
    })).catch(function (err) {
        //捕获异常
        console.log("搜索");
        console.error(err);
        sendJSONresponse(res, 200, {
            "message": err
        });
    });


});

module.exports = router;