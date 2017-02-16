/**
 * Created by zhouyong10 on 2/3/16.
 */
var db = require('../dbWrap');

var Class = require('./Class');

//var bcrypt = require('bcryptjs');
//var moment = require('moment');


var Product = new Class();


Product.extend(db);

Product.open = function() {
    return Product.openCollection('Product');
};

Product.include({
    getPriceByRole: function(role) {
        var price ;
        switch (role) {
            case '管理员':
                price = this.adminPrice;
                break;
            case '顶级代理':
                price = this.topPrice;
                break;
            case '超级代理':
                price = this.superPrice;
                break;
            case '金牌代理':
                price = this.goldPrice;
                break;
        }
        return price;
    },
    getPerByRole: function(role) {
        var per ;
        switch (role) {
            case '管理员':
                per = this.adminPer;
                break;
            case '顶级代理':
                per = this.topPer;
                break;
            case '超级代理':
                per = this.superPer;
                break;
            case '金牌代理':
                per = this.goldPer;
                break;
        }
        return per;
    }
});


module.exports = Product;