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
var querystring = require('querystring');

var http = require("http");
var https = require("https");
//设置响应内容
var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

var jsonParser = bodyParser.json();
//中间件用于校验
router.use('/', jsonParser, function (req, res, next) {
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

});

//验证用户token
function userTokenValidate(req, res, next) {

    var access_token = req.header("token");
    if (!access_token) {
        return 0;
    } else {
        var options = {
            hostname: 'https://id.shipxy.com',
            path:'/',
          //  port:443,
            method: 'get'
        };
        /* //post请求
         var request = http.request(options, function (err, response, bodyData) {
         console.log("........" + bodyData);
         if (err) {
         console.log(err);
         } else {
         var body = [];
         //response的data事件，其中data是获取到响应内容中的一部分时会触发改事件，function为回调函数
         response.on('data', function (chunk) {
         body.push(chunk);
         console.log(chunk);
         });
         console.log("============");
         //response的end事件，end是完全接收完响应内容时会触发改事件，function为回调函数
         response.on('end', function () {
         body = Buffer.concat(body);
         console.log(body.toString());
         });
         return 1;
         }
         });
         request.on("error", function (err) {
         console.log(err);
         });
         //发送数据
         request.write();
         //不能漏掉，结束请求，否则服务器将不会收到信息。
         request.end();*/

        var req = https.request(options, function (res) {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            var body = [];
            res.on('data', function (d) {
                body.push(chunk);
                console.log(chunk);
            });
            response.on('end', function () {
                body = Buffer.concat(body);
                console.log(body.toString());
            });
            return 1;
        });

        req.on('error', function (e) {
            console.error("kao:--------"+e);
            return 0;
        });
        //发送
        var data = {
            token: 13
        };
        var content = querystring.stringify(data);
        req.write(content);
        req.end();


    }
}


router.use('/', jsonParser, function (req, res, next) {

    //验证token
    var haveT = userTokenValidate(req, res, next);

    console.log("haveT:" + haveT);
    if (!haveT) {
        sendJSONresponse(res, 400, {
            "message": "非法用户.."
        });
        return;
    } else {
        console.log("。。。合法用户");
        // next();
    }

    //校验
    /* var clientReference = req.body.clientReference;
     if (!clientReference) {
     sendJSONresponse(res, 400, {
     "message": "非法用户.."
     });
     return;
     } else {
     //不能省略不然挂起..
     next();
     }*/

});


//添加消息到队列
router.put('/putMq', jsonParser, function (req, res, next) {


    console.log("putMq...");
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
            return;
        } else {
            sendJSONresponse(res, 200, node);
            return;
        }
    })

});

module.exports = router;