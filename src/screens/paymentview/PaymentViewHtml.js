import { BASE_URL } from '../../config/constants/network_constants';

export default (HTML = `
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://bobsal.gateway.mastercard.com/checkout/version/47/checkout.js"
    data-error="errorCallback"
    data-cancel="cancelCallback"
    data-complete="completeCallback"
    data-beforeRedirect="Checkout.saveFormFields"
    data-afterRedirect="Checkout.restoreFormFields"></script>
  <style media="screen">
    body {
      font-family: Helvetica Neue, HelveticaNeue, Helvetica, Arial, Tahoma;
      width: 320px;
      margin: auto;
      height: 480px;
    }
    strong {
      display: block;
      font-size: .7em;
    }
    center {
      text-align: center;
    }
    input[type=button], button {
      background-color: #8e2232;
      padding: 15px 20px;
      color: white;
      border: none;
      border-radius: 10px;
    }
    input[type=text] {
      height: 44px;
      padding: 0 5px;
      margin: 0 5px;
      border-radius: 10px;
      border: solid 1px #c0c0c0;
      margin-top: 5px;
      text-align: center;
    }
    .ptitle {
      margin-top: 10px;
    }
    #new_payment {
      background-color: #228e78;
    }
    #cancel {
      margin-top: 10px;
    }
    button.card_payment {
      background-color: #22738e;
      margin-top: 5px;
    }
    button.payment_fields {
      margin-top: 5px;
      background-color: #5cb85c;
    }
    [disabled] {
      opacity: 0.5;
      pointer-events: none;
    }
    .message-area {
      color: red;
    }
    .message-area p {
      margin-top: 0;
    }
    .container {
      text-align: center; margin-top: 25%; width: 100%;
    }
  </style>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
</head>
<body>
  <div class="container">
    <h1>$<span id="amount_total">0.00</span></h1>
    <button id="new_payment">NEW PAYMENT METHOD</button>

    <div class="ptitle"><strong id="existing_payments"></strong></div>
    <div class="button-area">

    </div>
    <div class="message-area">

    </div>
    <div class="center"><button id="cancel">CANCEL</button></div>
    <p><small>ORDER #: AGORA_ORDER_ID<br/>TRANSACTION #: ORDER_ID</small></p>
  </div>
  <script type="text/javascript">
  var session_id = '';
  var session = '';
  var api_token = 'ACCESS_TOKEN';
  var organization_id = ORGANIZATION_ID;
  var customer_id = 'CUSTOMER_ID';
  var amount = AMOUNT;
  var order_id = ORDER_ID;
  var agora_order_id = AGORA_ORDER_ID;
  var agora_payment_id = AGORA_PAYMENT_ID;
  var express_payment = EXPRESS_PAYMENT;

  $(document).ready(initialize);

  function initialize() {
    $('#new_payment').on('click', pay_with_lightbox);
    $('#cancel').on('click', cancel_payment);
    $('#amount_total').text(
      Number(amount)
        .toFixed(2)
        .toLocaleString()
    );

    if(express_payment.token && express_payment.cvv) {
      direct_payment(express_payment.token, express_payment.cvv)
    } else if(express_payment.token === 'new') {
      setTimeout(pay_with_lightbox, 1e3);
    } else {
      fetchCards();
    }
  }

  function fetchCards() {
    var settings = {
      async: true,
      crossDomain: true,
      url:
        '${BASE_URL}checkout/token?token=' +
        api_token +
        '&organization_id=' +
        organization_id +
        '&customer_id=' +
        customer_id,
      method: 'GET',
      headers: {}
    };

    $.ajax(settings).done(function(response) {
      window.postMessage('loaded');
      var dataLength = response.data.length;
      if(dataLength) $('.button-area').empty();
      for (i = 0; i < dataLength; i++) {
        var token_data = response.data[i];
        var number = token_data.token_response.sourceOfFunds.provided.card.number;
        var brand = token_data.token_response.sourceOfFunds.provided.card.brand;
        addDirectPaymentButton(number, brand, token_data.token);
      }
      if (response.data.length == 0) pay_with_lightbox();
      else $('#existing_payments').text('PREVIOUS PAYMENT METHODS');
    });
  }

  function cancel_payment() {
    window.postMessage('cancelled');
  }

  function addDirectPaymentButton(number, brand, token) {
    var button = $('<button/>', {
      class: 'card_payment',
      text: number + ' - ' + brand
    });
    var div = $('<div></div>');
    button.on('click', function(e) {
      $('.button-area')
        .find('.payment_fields')
        .remove();

      var cvcInp = $('<input/>', {
        type: 'text',
        class: 'payment_fields cvc_input',
        size: 9,
        placeholder: 'CVC / CVV'
      });
      var payButton = $('<button/>', {
        class: 'payment_fields pay_button',
        text: 'PAY NOW'
      });

      $(e.currentTarget)
        .parent('div')
        .append(cvcInp)
        .append(payButton);
      cvcInp.focus();

      payButton.on('click', function(e) {
        var cvc = $(e.currentTarget)
          .prev('.cvc_input')
          .val();
        $('.message-area').text('');

        if (cvc != '' && cvc.length === 3) {
          $('.button-area')
            .find('.payment_fields')
            .remove();

          direct_payment(token, cvc);
        } else {
          cvcInp.focus();
          $('.message-area').html('<p><b>Invalid CVV / CVC!</b><p>');
        }
      });
    });
    div.append(button);
    $('.button-area').append(div);
  }

  function pay_with_lightbox() {
    window.postMessage('loading');
    $('.message-area').text('');

    var form = new FormData();
    form.append('token', api_token);
    form.append('organization_id', organization_id);
    form.append('order_id', order_id);
    form.append('amount', amount);
    form.append('customer_id', customer_id);

    var settings = {
      async: true,
      crossDomain: true,
      url: '${BASE_URL}checkout/session',
      dataType: 'json',
      method: 'POST',
      headers: {},
      processData: false,
      contentType: false,
      mimeType: 'multipart/form-data',
      data: form
    };

    $('#new_payment')
      .text('PROCESSING...')
      .prop('disabled', true);

    $.ajax(settings).done(function(response) {
      setTimeout(function() {
        window.postMessage('loaded');
        $('#new_payment')
          .text('NEW PAYMENT METHOD')
          .prop('disabled', false);
      }, 3e3);

      if (response.status == 200) {
        session = response.data;
        session_id = response.data.session.id;

        Checkout.configure({
          merchant: 'RD',
          order: {
            amount: amount,
            currency: 'USD',
            description: 'Ordered goods',
            id: order_id
          },
          session: {
            id: session_id
          },
          interaction: {
            merchant: {
              name: 'Bar Tartine',
              address: {
                line1: 'Beirut',
                line2: 'Lebanon'
              },
              logo: 'https://goo.gl/ZD7XMr'
            },
            displayControl: {
              billingAddress: 'HIDE',
              customerEmail: 'HIDE',
              orderSummary: 'HIDE',
              shipping: 'HIDE'
            }
          }
        });
        Checkout.showLightbox();
      } else {
        $('.message-area').text(response.data.error);
      }
    });
  }

  function direct_payment(token, security_code) {
    window.postMessage('loading');
    $('.message-area').text('');
    $('#new_payment')
      .text('PROCESSING...')
      .prop('disabled', true);

    var form = new FormData();
    form.append('token', api_token);
    form.append('organization_id', organization_id);
    form.append('order_id', order_id);
    form.append('amount', amount);
    form.append('pay_token', token);
    form.append('security_code', security_code);
    form.append('transaction_id', Math.floor(Math.random() * 100000));
    form.append('customer_id', customer_id);

    var settings = {
      async: true,
      crossDomain: true,
      url: '${BASE_URL}checkout/pay',
      dataType: 'json',
      method: 'POST',
      headers: {},
      processData: false,
      contentType: false,
      mimeType: 'multipart/form-data',
      data: form
    };
    $('.card_payment').prop('disabled', true);

    $.ajax(settings).done(function(response) {
      window.postMessage('loaded');
      setTimeout(function() {
        window.postMessage('loaded');
        $('#new_payment')
          .text('NEW PAYMENT METHOD')
          .prop('disabled', false);
      }, 3e3);

      if (checkResults(response)) {
        concludeTransaction('success')
      }
    });
  }

  function checkResults(response) {
    var data = response.data;
    if (data.error || data.result.match(/error|fail/i)) {
      $('.message-area').html(
        '<strong>Transaction Error</strong><p>' + ((data.error && data.error.explanation) || (data.response && data.response.acquirerMessage) || 'Please check the details of your Card.') + '</p>'
      );
      $('.card_payment').prop('disabled', false);
      fetchCards();
      return false;
    }
    return true;
  }

  var firstError = true;
  function errorCallback(error) {
    window.postMessage('loaded');
    if(!firstError) {
      window.postMessage('loaded');
      $('.message-area').html(
        '<strong>Transaction Error</strong><p>' + error.explanation + '</p>'
      );
      sendOrderResults({
        status: error.explanation
      })
    }
    firstError = false;
  }

  function cancelCallback() {
    window.postMessage('loaded');
    sendOrderResults({
      status: 'cancelled'
    })
  }

  function completeCallback(data, data2) {
    if(express_payment.saveCard) {
      var form = new FormData();
      form.append('token', api_token);
      form.append('organization_id', organization_id);
      form.append('session_id', session_id);
      form.append('customer_id', customer_id);

      var settings = {
        async: true,
        crossDomain: true,
        url: '${BASE_URL}checkout/token',
        dataType: 'json',
        method: 'POST',
        headers: {},
        processData: false,
        contentType: false,
        mimeType: 'multipart/form-data',
        data: form
      };

      $.ajax(settings).done(function(response) {
        sendOrderResults({
          resultIndicator: data,
          sessionVersion: data2,
          status: 'success'
        })
      });
    } else {
      sendOrderResults({
        resultIndicator: data,
        sessionVersion: data2,
        status: 'success'
      })
    }
  }

  function sendOrderResults(results) {
    var form = new FormData();
    form.append('token', api_token);
    form.append('organization_id', organization_id);
    form.append('session_id', session_id);
    form.append('CustomerId', customer_id);
    form.append('agora_order_id', agora_order_id);
    form.append('agora_payment_id', agora_payment_id);
    form.append('gateway_response', JSON.stringify(results));
    var settings = {
      async: true,
      crossDomain: true,
      url: '${BASE_URL}checkout/gateway_response',
      dataType: 'json',
      method: 'POST',
      headers: {},
      processData: false,
      contentType: false,
      mimeType: 'multipart/form-data',
      data: form
    };
    $.ajax(settings).done(function(response) {
      concludeTransaction(results.status)
    });
  }

  function concludeTransaction(status) {
    window.postMessage('loaded');
    window.postMessage(status || 'success');
  }

  Checkout.configure({
    merchant: 'RD',
    order: {
      amount: amount,
      currency: 'USD',
      description: 'Ordered goods',
      id: order_id
    },
    interaction: {
      merchant: {
        name: 'Bar Tartine',
        address: {
          line1: 'Beirut',
          line2: 'Lebanon'
        },
        logo: 'https://goo.gl/ZD7XMr'
      },
      displayControl: {
        billingAddress: 'HIDE',
        customerEmail: 'HIDE',
        orderSummary: 'HIDE',
        shipping: 'HIDE'
      }
    }
  });
  </script>
</body>
</html>`);
