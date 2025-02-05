/* global timapi */
function send_Amount(Amount) {
    try {
        var response = Android.startPayment(Amount.toString());
        console.log("Passed Android function");

        if (response.includes("|")) {
            console.log("Passed Include function");
            var responseArray = response.split("|");
            console.log("Passed split function");

            var status = responseArray[0];

            switch (status) {
                case "0":
                    console.log("Approved");
                    // Store the payment data in PaymentSix instance for later use
                    window.paymentResponseData = {
                        cardholderName: responseArray[1], // Masked PAN
                        cardType: responseArray[2],       // Scheme Name
                        transactionId: responseArray[6]   // Reference No
                    };
                    return new Promise((resolve) => {
                        this.transactionResolve = resolve;
                        this.transactionResolve(true);
                    });
                case "1":
                    console.log("Retry");
                    return Promise.resolve();
                default:
                    console.warn("Invalid payment status:", status);
                    return Promise.resolve();
            }
        } else {
            console.warn("Error response :", response);
            return Promise.resolve();
        }
    } catch (error) {
        console.error(error);
        return Promise.reject(error);
    }
}

odoo.define('pos_surepay.payment', function (require) {
    "use strict";

    const { Gui } = require('point_of_sale.Gui');
    var core = require('web.core');
    var PaymentInterface = require('point_of_sale.PaymentInterface');
    const { escape } = require("@web/core/utils/strings");
    var _t = core._t;
    console.error("SUREPAY IMPLE.2212");
    console.log('oooooo');

    window.onTimApiReady = function () {};
    window.onTimApiPublishLogRecord = function (record) {
        if (record.matchesLevel(timapi.LogRecord.LogLevel.warning)) {
            timapi.log(String(record));
        }
    };

    var PaymentSix = PaymentInterface.extend({
        init: function () {
            this._super.apply(this, arguments);
            this.enable_reversals();

            var terminal_ip = this.payment_method.six_terminal_ip;
            var instanced_payment_method = _.find(this.pos.payment_methods, function(payment_method) {
                return payment_method.use_payment_terminal === "six"
                    && payment_method.six_terminal_ip === terminal_ip
                    && payment_method.payment_terminal;
            });

            if (instanced_payment_method !== undefined) {
                var payment_terminal = instanced_payment_method.payment_terminal;
                this.terminal = payment_terminal.terminal;
                this.terminalListener = payment_terminal.terminalListener;
                return;
            }

            var settings = new timapi.TerminalSettings();
            settings.connectionMode = timapi.constants.ConnectionMode.onFixIp;
            settings.connectionIPString = this.payment_method.six_terminal_ip;
            settings.connectionIPPort = "80";
            settings.integratorId = "175d97a0-2a88-4413-b920-e90037b582ac";
            settings.dcc = false;

            this.terminal = new timapi.Terminal(settings);
            this.terminal.setPosId(this.pos.pos_session.name);
            this.terminal.setUserId(this.pos.pos_session.user_id[0]);

            this.terminalListener = new timapi.DefaultTerminalListener();
            this.terminalListener.transactionCompleted = this._onTransactionComplete.bind(this);
            this.terminalListener.balanceCompleted = this._onBalanceComplete.bind(this);
            this.terminal.addListener(this.terminalListener);

            var recipients = [timapi.constants.Recipient.merchant, timapi.constants.Recipient.cardholder];
            var options = [];
            _.forEach(recipients, (recipient) => {
                var option = new timapi.PrintOption(
                    recipient,
                    timapi.constants.PrintFormat.normal,
                    45,
                    [timapi.constants.PrintFlag.suppressHeader, timapi.constants.PrintFlag.suppressEcrInfo]
                );
                options.push(option);
            });
            this.terminal.setPrintOptions(options);
        },

        send_payment_cancel: function () {
            this._super.apply(this, arguments);
            this.terminal.cancel();
            return Promise.resolve();
        },

        send_payment_request: function () {
            var Amount = this.pos.get_order().selected_paymentline.amount * 100;
            this._super.apply(this, arguments);
            this.pos.get_order().selected_paymentline.set_payment_status('waitingCard');
            return send_Amount(Amount);
        },

        send_payment_reversal: function () {
            this._super.apply(this, arguments);
            this.pos.get_order().selected_paymentline.set_payment_status('reversing');
            return this._sendTransaction(timapi.constants.TransactionType.reversal);
        },

        send_balance: function () {
            this.terminal.balanceAsync();
        },

        _onTransactionComplete: function (event, data) {
            timapi.DefaultTerminalListener.prototype.transactionCompleted(event, data);

            if (data.printData) {
                this._printReceipts(data.printData.receipts);
            }

            // Store Transaction Data
            var transactionData = new timapi.TransactionData();
            transactionData.transSeq = data.transactionInformation.transSeq;
            this.terminal.setTransactionData(transactionData);

            // Set the payment response data from the Android terminal
            if (window.paymentResponseData) {
                const paymentLine = this.pos.get_order().selected_paymentline;
                if (paymentLine) {
                    paymentLine.card_type = window.paymentResponseData.cardType;
                    paymentLine.cardholder_name = window.paymentResponseData.cardholderName;
                    paymentLine.transaction_id = window.paymentResponseData.transactionId;
                }
                // Clear the temporary storage
                window.paymentResponseData = null;
            }

            this.transactionResolve(true);
        },

        _onBalanceComplete: function (event, data) {
            if (event.exception) {
                Gui.showPopup('ErrorPopup',{
                    'title': _t('Balance Failed'),
                    'body':  _t('The balance operation failed.'),
                });
            } else {
                this._printReceipts(data.printData.receipts);
            }
        },

        _printReceipts: function (receipts) {
            _.forEach(receipts, (receipt) => {
                if (receipt.recipient === timapi.constants.Recipient.merchant && this.pos.env.proxy.printer) {
                    this.pos.env.proxy.printer.print_receipt(
                        "<div class='pos-receipt'><div class='pos-payment-terminal-receipt'>" +
                            escape(receipt.value).replace(/\n/g, "<br />") +
                        "</div></div>"
                    );
                } else if (receipt.recipient === timapi.constants.Recipient.cardholder) {
                    this.pos.get_order().selected_paymentline.set_receipt_info(receipt.value);
                }
            });
        },

        _sendTransaction: function (transactionType) {
            var amount = new timapi.Amount(
                Math.round(this.pos.get_order().selected_paymentline.amount / this.pos.currency.rounding),
                timapi.constants.Currency[this.pos.currency.name],
                this.pos.currency.decimal_places
            );
            return new Promise((resolve) => {
                this.transactionResolve = resolve;
                this.terminal.transactionAsync(transactionType, amount);
            });
        },
    });

    return PaymentSix;

});