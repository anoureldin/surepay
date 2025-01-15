odoo.define('pos_surepay.models', function (require) {

var models = require('point_of_sale.models');
var PaymentSix = require('pos_surepay.payment');

models.register_payment_method('six', PaymentSix);
});
