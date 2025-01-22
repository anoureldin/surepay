{
    'name': 'POS Arabic Receipt Advance / POS Customized Receipt(Arabic Receipt)',
    'version': '16.3.2.1',
    'sequence': 1,
    'email': 'apps@maisolutionsllc.com',
    'website':'http://maisolutionsllc.com/',
    'category': 'Point of Sale',
    'summary': 'POS Customized Receipt advance (Arabic Receipt)',
    'author': 'MAISOLUTIONSLLC',
    'price': 25,
    'currency': 'EUR',
    'license': 'OPL-1',
    'description': """
    POS Customized Receipt advance (Arabic Receipt)
        """,
    "live_test_url" : "",
    'depends': ['point_of_sale'],
    'data': ['views/product_view.xml'],
    'images': ['static/description/main_screenshot.png'],
    'demo': [],
    'installable': True,
    'auto_install': False,
    'application': True,
    'assets': {
        'point_of_sale.assets': [
            'mai_pos_receipt_arabic_advance/static/src/js/JsBarcode.all.min.js',
            'mai_pos_receipt_arabic_advance/static/src/js/models.js',
            'mai_pos_receipt_arabic_advance/static/src/js/OrderReceipt.js',
            'mai_pos_receipt_arabic_advance/static/src/xml/templates.xml',
        ],
    },    
}
