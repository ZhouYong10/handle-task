/**
 * Created by zhouyong10 on 2/3/16.
 */
var db = require('../dbWrap');

var Class = require('./Class');

//var bcrypt = require('bcryptjs');
//var moment = require('moment');


var Placard = new Class();


Placard.extend(db);

Placard.open = function() {
    return Placard.openCollection('Placard');
};

Placard.include({

});


module.exports = Placard;