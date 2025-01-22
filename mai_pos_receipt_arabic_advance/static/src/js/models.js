odoo.define("mai_pos_receipt_arabic_advance.models", function (require) {
"use strict";

	var { Order, Orderline, PosGlobalState} = require('point_of_sale.models');
	const Registries = require('point_of_sale.Registries');


	const customOrder = (Order) => class customOrder extends Order{
        constructor(obj, options) {
        	super(...arguments);
        	this.order_barcode = this.order_barcode || " ";
			this.set_order_barcode();
		}

		export_as_JSON() {
			const json = super.export_as_JSON(...arguments);
			json.order_barcode = this.order_barcode;
			return json;
		}
		init_from_JSON(json) {
			super.init_from_JSON(...arguments);
			this.order_barcode = json.order_barcode || 1;
		}
		get_order_barcode(){
			return this.order_barcode;
		}
		set_order_barcode() {
			this.order_barcode = Math.floor(100000000000 + Math.random() * 9000000000000);
		}
   }
   Registries.Model.extend(Order, customOrder);
})

