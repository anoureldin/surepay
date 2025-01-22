{
    'name': 'Fix Gulf Cooperation Council - Point of Sale',
    'version': '1.0',
    'license': 'LGPL-3',
    'category': 'Accounting/Localizations/Point of Sale',
    'depends': [
        'l10n_sa_pos'
    ],
    'assets': {
        'point_of_sale.assets': [
            ('replace', 'l10n_gcc_pos/static/src/xml/OrderReceipt.xml', 'fix_l10n_gcc_pos/static/src/xml/OrderReceipt.xml'),
            ('remove', 'l10n_sa_pos/static/src/xml/OrderReceipt.xml')
        ]
    },
    'auto_install': False,
    'application': False
}