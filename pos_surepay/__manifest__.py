# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    'name': 'POS SurePay',
    'version': '1.0',
    'category': 'Sales/Point Of Sale',
    'sequence': 6,
    'summary': 'Integrate your POS with a Six payment terminal',
    'data': [
        'views/pos_payment_method_views.xml',
    ],
    'depends': ['point_of_sale'],
    'installable': True,
    'license': 'LGPL-3',
    'assets': {
        'point_of_sale.assets': [
            'pos_surepay/static/lib/six_timapi/timapi.js',
            'pos_surepay/static/src/js/BalanceButton.js',
            'pos_surepay/static/src/js/Chrome.js',
            'pos_surepay/static/src/js/models.js',
            'pos_surepay/static/src/js/payment_six.js',
            'pos_surepay/static/src/xml/**/*',
        ],
    }
}
