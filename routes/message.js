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
    //校验
    var clientReference = req.body.clientReference;
    if (!clientReference) {
        return 0;
    } else {
        return 1;
    }

}
//中间件用于校验用户token
router.use('/', jsonParser, function (req, res, next) {
    if (req.method==="PUT"){
        var v = validateData(req, res, next);
        if (v === 0) {
            sendJSONresponse(res, 200, {
                "message": "数据校验未通过.."
            });
        }
    }
    next();

});
//中间件用于校验身份
/*router.use('/', jsonParser, function (req, res, next) {
 //校验身份
 access_token.accessToken("https://id.shipxy.com/core/connect/accesstokenvalidation", "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImEzck1VZ01Gdjl0UGNsTGE2eUYzekFrZnF1RSIsImtpZCI6ImEzck1VZ01Gdjl0UGNsTGE2eUYzekFrZnF1RSJ9.eyJpc3MiOiJodHRwczovL2lkLnNoaXB4eS5jb20vY29yZSIsImF1ZCI6Imh0dHBzOi8vaWQuc2hpcHh5LmNvbS9jb3JlL3Jlc291cmNlcyIsImV4cCI6MTQ4ODc3NjY5OCwibmJmIjoxNDg4NzczMDk4LCJjbGllbnRfaWQiOiJkZW1vaWQiLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIl0sInN1YiI6Ijk2YWU5MTQzZDJjNzBlMDkiLCJhdXRoX3RpbWUiOjE0ODg3NjM1MDcsImlkcCI6Imlkc3J2IiwiYW1yIjpbInBhc3N3b3JkIl19.CKSbZKkCzLupZoxjgyeGL4GVfkn-B8hgTO25V-uIXhKnzTUI78JSgfU9iQGQ0Itlti6VS__OHYHenLb5gO8jh9awRC0hiEWEikU4UMrE5hl-FcvkRxnQPPivKljsqvBwYVx_HLGNdlBL1tjTjEaM9er3sjV1LsLERVuZ3McnZlANV2YGdBcqr8voNo7BF_uMs8Wol11CszL2EWZtx_OehKU-K2_jwO4L9W23W-XzctZZVGBRJ5_nlSmi9tqosOSPThROx8RYrNfsyDCPLn2L9wVQEAloM1UJFrc-eobt5DIUaPPgn9GEpEVE55SNxieGcSIO72tm_nxVP53Nw5MDMQ").then(function (data) {
 //获取校验后的返回值
 console.log("....tk:"+data.Message);

 if (data.Message) {
 sendJSONresponse(res, 200, {
 "message": "令牌失效.."
 });
 return;
 } else {
 if(data.iss){
 console.log("iss:"+data.iss);
 next();
 }
 }
 }).catch(function (err) {
 console.error(err);
 });
 });*/


//添加消息到队列
router.put('/putMq', jsonParser, function (req, res, next) {
    //校验身份
    access_token.accessToken("https://id.shipxy.com/core/connect/accesstokenvalidation", "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImEzck1VZ01Gdjl0UGNsTGE2eUYzekFrZnF1RSIsImtpZCI6ImEzck1VZ01Gdjl0UGNsTGE2eUYzekFrZnF1RSJ9.eyJpc3MiOiJodHRwczovL2lkLnNoaXB4eS5jb20vY29yZSIsImF1ZCI6Imh0dHBzOi8vaWQuc2hpcHh5LmNvbS9jb3JlL3Jlc291cmNlcyIsImV4cCI6MTQ4ODc4NDE1MCwibmJmIjoxNDg4NzgwNTUwLCJjbGllbnRfaWQiOiJkZW1vaWQiLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIl0sInN1YiI6Ijk2YWU5MTQzZDJjNzBlMDkiLCJhdXRoX3RpbWUiOjE0ODg3ODA1NTAsImlkcCI6Imlkc3J2IiwiYW1yIjpbInBhc3N3b3JkIl19.G8CvaWdjdyqKsxwWzCyptdKo5QzEEWIz7oI59O8PXGi_3tbH_vTtaW2_G_C-UAhm_VqHqmyII8KRk0NF_PjrBxa4mVLVEe2PlRfLssR1q-7KvNxbnBxNE-4R7O77l3Sm2MZrS3zeXVpZ05Po208UNzDl2uTmz4DkjjJwR1k1tplxyiPY9hXLmfMdAEhx9gWRgtEDcmGizQ2s4I9odKbmalGOdwb8LrXLNL5nvT4iGWtOd2ajyWSD_xewoE5AqQ-Q6wPCJRlZgQjl_TrgGV5vDJ-49iifYP9-2oCmccunsZ1cT70PmVzhz2swidXW3TJSZxKAO8ZLJEkDIPdlh_c7yA").then(function (data) {
        //获取校验后的返回值
        if (data.Message) {
            sendJSONresponse(res, 200, {
                "message": "令牌失效.."
            });
        } else {
            if (data.iss) {
                //身份验证通过
                console.log("身份通过...putMq..." + data.iss + "," + req.body.clientReference);
                Mq.create({
                    clientReference: req.body.clientReference,
                    fromTenantId: req.body.fromTenantId,
                    toTenantId: req.body.toTenantId,
                    fromPlatformId: req.body.fromPlatformId,
                    toPlatformId: req.body.toPlatformId,
                    payload: req.body.payload
                }, function (err, node, num) {
                    if (err) {
                        sendJSONresponse(res, 500, {"message": "存储失败.."});
                        return;
                    } else {
                        sendJSONresponse(res, 200, node);
                        return;
                    }
                });
            }
        }
    }).catch(function (err) {
        console.error(err);
        sendJSONresponse(res, 200, err);
    });

});

//根据标识获取数据
router.get('/findOne/:id', function (req, res, next) {
    //req.query 获取get请求?后面的参数， req.params获取"/"后面的参数值,req.body.xx获取post参数值
    console.log("...get..."+ req.params.id);
    //校验身份
    access_token.accessToken("https://id.shipxy.com/core/connect/accesstokenvalidation", "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImEzck1VZ01Gdjl0UGNsTGE2eUYzekFrZnF1RSIsImtpZCI6ImEzck1VZ01Gdjl0UGNsTGE2eUYzekFrZnF1RSJ9.eyJpc3MiOiJodHRwczovL2lkLnNoaXB4eS5jb20vY29yZSIsImF1ZCI6Imh0dHBzOi8vaWQuc2hpcHh5LmNvbS9jb3JlL3Jlc291cmNlcyIsImV4cCI6MTQ4ODc4NDE1MCwibmJmIjoxNDg4NzgwNTUwLCJjbGllbnRfaWQiOiJkZW1vaWQiLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIl0sInN1YiI6Ijk2YWU5MTQzZDJjNzBlMDkiLCJhdXRoX3RpbWUiOjE0ODg3ODA1NTAsImlkcCI6Imlkc3J2IiwiYW1yIjpbInBhc3N3b3JkIl19.G8CvaWdjdyqKsxwWzCyptdKo5QzEEWIz7oI59O8PXGi_3tbH_vTtaW2_G_C-UAhm_VqHqmyII8KRk0NF_PjrBxa4mVLVEe2PlRfLssR1q-7KvNxbnBxNE-4R7O77l3Sm2MZrS3zeXVpZ05Po208UNzDl2uTmz4DkjjJwR1k1tplxyiPY9hXLmfMdAEhx9gWRgtEDcmGizQ2s4I9odKbmalGOdwb8LrXLNL5nvT4iGWtOd2ajyWSD_xewoE5AqQ-Q6wPCJRlZgQjl_TrgGV5vDJ-49iifYP9-2oCmccunsZ1cT70PmVzhz2swidXW3TJSZxKAO8ZLJEkDIPdlh_c7yA").then(function (data) {
        //获取校验后的返回值
        if (data.Message) {
            sendJSONresponse(res, 200, {
                "message": "令牌失效.."
            });
        } else {
            if (data.iss) {
                //身份验证通过
                console.log("身份通过...get..." + JSON.stringify(data)+","+req.query.clientReference);
                Mq.findOne({
                    clientReference:  req.params.id
                }, function (err, node, num) {
                    if (err) {
                        sendJSONresponse(res, 500, {"message": "获取失败.."});
                        return;
                    } else {
                        sendJSONresponse(res, 200, node);
                        return;
                    }
                });
            }
        }
    }).catch(function (err) {
        console.error(err);
        sendJSONresponse(res, 200, err);
    });
});

module.exports = router;