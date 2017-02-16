/**
 * Created by ubuntu64 on 2/24/16.
 */
var AlipayRecord = require('./db').getCollection('AlipayRecord');

var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

var url = 'https://consumeprod.alipay.com/record/advanced.htm';

var headers = {
    "Accept": 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    //"Accept-Encoding": 'gzip, deflate, sdch',
    "Accept-Language": 'zh-CN,zh;q=0.8',
    "Cache-Control": 'max-age=0',
    "Connection": 'keep-alive',
    //"Content-Length": 923,
    //"Content-Type": 'application/x-www-form-urlencoded',
    "Cookie": 'JSESSIONID=RZ13AbhusinpfH0CYwma1KRT1qumkEauthRZ12GZ00; cna=DcVRD1E/WkICAXWvtPL2uBgH; BIG_DOOR_SHOWTIME=2016124; unicard1.vm=K1iSL1mnW5fPkpzjDbh2JpELG6WOx62qGmMqwjUwZyAG; l=AhgYtJJcCXk/PLwT62fCurI4aEyqBnyL; session.cookieNameId=ALIPAYJSESSIONID; JSESSIONID=8A66090999CA9A3AAC983465CA560E41; mobileSendTime=-1; credibleMobileSendTime=-1; ctuMobileSendTime=-1; riskMobileBankSendTime=-1; riskMobileAccoutSendTime=-1; riskMobileCreditSendTime=-1; riskCredibleMobileSendTime=-1; riskOriginalAccountMobileSendTime=-1; ctoken=rSgtcfphZoh0wo-Y; LoginForm=alipay_login_auth; alipay="K1iSL1p2igfloycw9TMIMKtwyKEelNTp9ogfwfM9KFjlPr+fQdOaV6E="; CLUB_ALIPAY_COM=2088312459078522; iw.userid="K1iSL1p2igfloycw9TMIMA=="; ali_apache_tracktmp="uid=2088312459078522"; zone=RZ12B; NEW_ALIPAY_HOME=2088022634269985,2088312459078522-old,2088612196567700-old; ALIPAYJSESSIONID=RZ12XY2dYDaAi0qAMtMHEjFjXkumqbauthRZ12GZ00; spanner=jeA2459U8EOS2VHoOUsNGzVoqnqUc1cH4EJoL7C0n0A=',
    "Cookie": 'JSESSIONID=RZ13AbhusinpfH0CYwma1KRT1qumkEauthRZ12GZ00; cna=DcVRD1E/WkICAXWvtPL2uBgH; BIG_DOOR_SHOWTIME=2016124; unicard1.vm=K1iSL1mnW5fPkpzjDbh2JpELG6WOx62qGmMqwjUwZyAG; l=AhgYtJJcCXk/PLwT62fCurI4aEyqBnyL; session.cookieNameId=ALIPAYJSESSIONID; JSESSIONID=8A66090999CA9A3AAC983465CA560E41; mobileSendTime=-1; credibleMobileSendTime=-1; ctuMobileSendTime=-1; riskMobileBankSendTime=-1; riskMobileAccoutSendTime=-1; riskMobileCreditSendTime=-1; riskCredibleMobileSendTime=-1; riskOriginalAccountMobileSendTime=-1; ctoken=rSgtcfphZoh0wo-Y; LoginForm=alipay_login_auth; alipay="K1iSL1p2igfloycw9TMIMKtwyKEelNTp9ogfwfM9KFjlPr+fQdOaV6E="; CLUB_ALIPAY_COM=2088312459078522; iw.userid="K1iSL1p2igfloycw9TMIMA=="; ali_apache_tracktmp="uid=2088312459078522"; zone=RZ12A; lzstat_uv=8858960242189954097|2962178; lzstat_ss=887276147_0_1459246877_2962178; NEW_ALIPAY_HOME=2088022634269985,2088312459078522-old,2088612196567700-old; ALIPAYJSESSIONID=RZ12XY2dYDaAi0qAMtMHEjFjXkumqbauthRZ12GZ00; spanner=jeA2459U8EOS2VHoOUsNGzVoqnqUc1cH4EJoL7C0n0A=',
    "Host": 'consumeprod.alipay.com',
    //"Origin": 'https://consumeprod.alipay.com',
    "Referer": 'https://authgtj.alipay.com/login/loginResultDispatch.htm',
    "Upgrade-Insecure-Requests": 1,
    "User-Agent": 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36'
};

var formData = {
    "rdsToken":"n7TeIRtNONASdkTr7cpSepXo6aKpETko",
    "rdsUa":"171n+qZ9mgNqgJnCG0WtMC3zbvMsMaxxr7be9s=|nOiH84T8gPSD+oP6if2O+1s=|neiHGXz6UeRW5k4rRCFWLUgnQth0xWLQaty5Gbk=|mu6b9JEgWs1l6XzLWshZ3UvsQtVgGrwPmTGCGavSdvhLw1T6SC2N|m++T/GIRfgd8CmURawRh138UZ9yqA3UYax5pH3YPcx962no=|mOOM6Yws|meWK74oq|luKW+WcCqR6pGqzRo9F3xXTCespi0WTWcQCkC6cUsAx922nZqx62EKIXsMJmwXjcbctjxLUeqRl8E3YTsxM=|l+GOEGMMfxBkGGsdcgZyCXEeahZjEH8LeANwH2sXYhF+CnkOctJy|lOCT/JkHfAVwH4Dlkeae55Plk++U4Z3ulilaK1EqViVcJVIpVS9ULFAjXyW637DEZAGh|le2CHHkcc+2U4pH+i/+L5JzrkuOb9ID8gO+b6J/whf5eMUItSONW/lfXv8q82bbCscuyErI=|kuiHGXwZdgJtGWoQa8tr|k+SLFXAVegN0AW4bbxt0AHUNcdFx|kOiHGXwZduiQ7JD/iv2KKkU2WTxZNkI5QT2dPQ==|keuEGn8adQZpHWYfa8tr|jvmWCG3gkD6WKpAilzBVOkM7Qi1YL1M8STpAOJg4|j/iXCWwJZhpgFXoMeA1iF2AZY8Nj|jPuUCm8KZRFlHWgHcgd7FGEdaRCwEA==|jfWaBGEEa/WB9YL0m+6a74D0h/OK+4PsmOSY94P7gu2Y40MsXzBV/kvjSsqi16HEq92p0qEBoQ==|ivCfAWQBbhp1A3cMe9t7|i/yTDWgNYhZiG24BdA51GmwVbxe3Fw==|iP+QDmsOYRVmHG8AdwR4F2AbYBa2Fg==|ifGeAGUAb/GF9oDznOuf6kolVjlcOVYuVytX91c=|hvyTDWgNYhF+BnwPd9d3|h/CfAWTTYdJE7Ej9W/B5y37Oq8Sww7TOodai0b7GvcewELA=|hPOcAmcCbRltGWUKfwR9EmseZhq6Gg==|hf2SDGkMY/2J/YnyneiU44z4i/+G94/gle6W+Y31jOOW7U0iUT5b8EXtRMSs2a/Kpd+r16wMrA==|gviXCWwJZhJ9B3IBdNR0|g/SbBWAFah5tFmMMegx6FW8Xbhm5GQ==|gPiXCWwJZviM/4jyneuT6kolVjlcOVYtWyBb+1s=|gfuUCm8KZRZ5AnQIfd19|vsmmOF3QoBauC7sXoNB5y37Oq8SwxbHFqtyk37DLssayErI=|v8inOVw5ViJVLlk2QTRBLlIrXiSEJA==|vMukOl/SohSsCbkVotJ7yXzMqcaywbXAr9mi3rHFts6yy2vL|vcqlO17ToxW9CnrOdt5r16cOvAm53LPKvseo3qXSvcm6xrrDY8M=|usKtM1bbqx21AnLGftZj368GtAGx1LslXSZTPEoxRuaJ+pXwlfqO+4P7ji6O|u8GuMFXYqB62AXHFfdVg3KwFtwKy17jMo9ei2qLZedk=|uM+8z6DTvMmm0qXRvsiwyqXdoc60zKPXo9S7z6DcqMezy6TSqcax3qrfsMa+0aXKudam0r3HqN6twrLFqtqizbvUodi3x7zTo9+wwLTbrtu0xLDFqtqtwrbKpdWh2bbGssuk1KDatcWxyqXVodK9yb8f",
    "beginDate":"",
    "beginTime":"00:00",
    "endDate":moment().format('YYYY.MM.DD'),
    "endTime":"24:00",
    "dateRange":"today",
    "status":"success",
    "keyword":"bizOutNo",
    "keyValue":"",
    "dateType":"createDate",
    "minAmount":"",
    "maxAmount":"",
    "fundFlow":"in",
    "tradeType":"ALL",
    "categoryId":"",
    "pageNum":1
};

function getInfoByUrl(path, cb) {
    request({
        url: path,
        headers: headers
    }, function (err, res, body) {
        //console.log(body, '==============================');
        if(err) {
            return console.log('抓取页面数据失败： ' + err);
        }
        cb(body);
    });
}


var count = 0;
setInterval(function() {
    getInfoByUrl(url, function(body) {
        var total = 0;
        var $ = cheerio.load(body);
        $('#tradeRecordsIndex .J-item').each(function(i,e) {
            var time = $(e).children('.time');
            var order = {
                createTime: time.children('.time-d').text().match(/\d+.\d+.\d+/) + ' ' + time.children('.time-h').text().match(/\d+:\d+/),
                orderNum: $(e).children('.tradeNo').children().text().split(':')[1],
                funds: $(e).children('.amount').children().text().split(' ')[1]
            };

            AlipayRecord.findAndModify({
                createTime: order.createTime
            }, [], {$set: order}, {
                new: true,
                upsert: true
            }, function (error, result) {
                if (error) {
                    return console.log('保存抓取数据到数据库失败： ' + error);
                }

                console.log('保存到数据库的记录为： ' + ++total);
                console.log(result);
            });
        })
    });
    console.log(++count, '-----------------------------------------------------');
}, 10000);



