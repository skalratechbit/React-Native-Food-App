import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';
import { APP_COLOR_WHITE, APP_COLOR_RED, APP_COLOR_BLACK } from '../../config/colors';
import { IF_OS_IS_IOS, FONT_SCALLING } from '../../config/common_styles';
import strings from '../../config/strings/strings';
import { ABOUT_RED_IMAGE, ABOUT_BACKGROUND_IMAGE } from '../../assets/images';
import { DINENGSCHRIFT_REGULAR, HELVETICANEUE_LT_STD_CN } from '../../assets/fonts';
import Common from "../../components/Common";

const HTML = `
<html>
<head>
<!-- INCLUDE SESSION.JS JAVASCRIPT LIBRARY -->
<script src="https://eu-gateway.mastercard.com/form/version/34/merchant/<MERCHANTID>/session.js"></script>

<!-- APPLY CLICK-JACKING STYLING AND HIDE CONTENTS OF THE PAGE -->
<style id="antiClickjack">body{display:none !important;}</style>
</head>
<body>

<!-- CREATE THE HTML FOR THE PAYMENT PAGE -->

<div>Please enter your payment details:</div>
<div>Card Number: <input type="text" id="card-number" class="input-field" value="" ></div>
<div>Expiry Month:<input type="text" id="expiry-month" class="input-field" value=""></div>
<div>Expiry Year:<input type="text" id="expiry-year" class="input-field" value=""></div>
<div>Security Code:<input type="text" id="security-code" class="input-field" value="" readonly></div>
<div><button id="payButton" onclick="pay();">Pay Now</button></div>

<!-- DISPLAY VISA CHECKOUT AS A PAYMENT OPTION ON YOUR PAYMENT PAGE -->

<!-- REPLACE THE action URL with the payment URL on your webserver -->
<!-- Other fields can be added to enable you to collect additional data on the payment page -->
Email: <input type="text" name="email">
<!-- The hidden values below can be set in the callback function as they are returned when creating the session -->
<input type="hidden" name="sessionId" id="sessionId">
<img id="visaCheckoutButton" alt="Visa Checkout" role="button" class="v-button" style="display: none;" src="https://sandbox.www.v.me/wallet-services-web/xo/button.png"/>
</form>

<!-- JAVASCRIPT FRAME-BREAKER CODE TO PROVIDE PROTECTION AGAINST IFRAME CLICK-JACKING -->
<script type="text/javascript">
if (self === top) {
  var antiClickjack = document.getElementById("antiClickjack");
  antiClickjack.parentNode.removeChild(antiClickjack);
} else {
  top.location = self.location;
}

PaymentSession.configure({
  fields: {
      // ATTACH HOSTED FIELDS TO YOUR PAYMENT PAGE
      cardNumber: "#card-number",
      securityCode: "#security-code",
      expiryMonth: "#expiry-month",
      expiryYear: "#expiry-year"
  },
  frameEmbeddingMitigation: ["javascript"],
  callbacks: {
      initialized: function(response) {
          // HANDLE INITIALIZATION RESPONSE
          if (response.status === "ok") {
              document.getElementById("visaCheckoutButton").style.display = 'block';
          }
      },
      formSessionUpdate: function(response) {
          // HANDLE RESPONSE FOR UPDATE SESSION
      if (response.status) {
          if ("ok" == response.status) {
              //console.log("Session updated with data: " + response.session.id);

              //check if the security code was provided by the user
              if (response.sourceOfFunds.provided.card.securityCode) {
                  //console.log("Security code was provided.");
              }

              //check if the user entered a MasterCard credit card
              if (response.sourceOfFunds.provided.card.scheme == 'MASTERCARD') {
                  //console.log("The user entered a MasterCard credit card.")
              }
          } else if ("fields_in_error" == response.status)  {

              //console.log("Session update failed with field errors.");
              if (response.errors.cardNumber) {
                   this.setState( {
                      alertVisibilty: true,
                      alertTitle:'Card number invalid or missing.',
                    });
                  //console.log("Card number invalid or missing.");
              }
              if (response.errors.expiryYear) {
                   this.setState( {
                      alertVisibilty: true,
                      alertTitle:'Expiry year invalid or missing.',
                    });
                 
                  //console.log("Expiry year invalid or missing.");
              }
              if (response.errors.expiryMonth) {
                  //console.log("Expiry month invalid or missing.");
              }
              if (response.errors.securityCode) {
                  //console.log("Security code invalid.");
              }
          } else if ("request_timeout" == response.status)  {
              //console.log("Session update failed with request timeout: " + response.errors.message);
          } else if ("system_error" == response.status)  {
              //console.log("Session update failed with system error: " + response.errors.message);
          }
      } else {
          //console.log("Session update failed: " + response);
      }
      },
      visaCheckout: function(response) {
          // HANDLE VISA CHECKOUT RESPONSE
      }
  },
  order: {
      amount: 10.00,
      currency: "AUD"
  },
  wallets: {
      visaCheckout: {
          enabled: true,
          // Add Visa Checkout API specific attributes here
          countryCode: "AU",
          displayName: "Display name",
          locale: "en_au",
          logoUrl: "http://logo.logo",
          payment: {
              cardBrands: [
                  "VISA"
              ]
          },
          review: {
              buttonAction: "Pay",
              message: "Message"
          },
          shipping: {
              acceptedRegions: [
                  "AU"
              ],
              collectShipping: true
          }
      }
  }
});

function pay() {
  // UPDATE THE SESSION WITH THE INPUT FROM HOSTED FIELDS
  PaymentSession.updateSessionFromForm();
}

</script>
</body>
<html>
`;

const TITLE_CONTAINER_HEIGHT = 52;
const TITLE_FONT_SIZE = 30;
const LEFT_RIGHT_MARGINS = 20;
const ABOUT_ICON_SIZE = 25.5;

const IMAGE_CONTAINER_HEIGHT = 249.5;
const DESCRIPTION_CONTAINER_HEIGHT = 255;
const DESCRIPTION_FONT_SIZE = 18;
const BROUGHT_TO_YOU_FONT_SIZE = 15.5;

const BOTTOM_CONTAINER_HEIGHT = 134;

class Payment extends Component {
  state = {
    componentTheme: {},
    alertVisibilty: false,
    alertTitle: '',
  };

  componentWillMount() {
    this.setThemeOfComponent();
  }
  setThemeOfComponent() {
    const theme = AsyncStorage.getItem('theme').then(data =>
      this.setState({ componentTheme: JSON.parse(data) })
    );
  }
  onPress = (event, caption) => {
    switch (caption) {
      case strings.CONTINUE:
        this.setState( {
          alertVisibilty: true,
          alertTitle:strings.CONTINUE,
        });
        break;

      case strings.ADD_ITEMS:
        this.setState( {
          alertVisibilty: true,
          alertTitle:strings.ADD_ITEMS,
        });
        break;

      default:
    }
  };
  onMessage = event => {
    //console.log('On Message', event.nativeEvent.data);
  };
  onWebViewLoad = event => {
    // this.webView.postMessage( this.state.componentTheme.status );
  };

  render() {
    const {
      container,
      subContainer,
      aboutTextStyle,
      aboutIconStyle,
      broughtToYouTextStyle,
      aboutDescriptionTextStyle,
      aboutDescriptionUnderlinedTextStyle
    } = styles;
const { alertVisibilty,
  alertTitle} =this.state
    return (
      <ScrollView>
        <View style={container}>
          <Common.Popup
              onClose={() => {
                this.setState({
                  alertVisibilty: false,
                  alertTitle: ''
                });
              }}
              color={thirdColor}
              visibilty={alertVisibilty}
              heading={alertTitle}

          />
          <View style={[subContainer, { height: TITLE_CONTAINER_HEIGHT }]}>
            <Text
              allowFontScaling={FONT_SCALLING}
              style={[aboutTextStyle, { color: this.state.componentTheme.thirdColor }]}>
              {strings.PAYMENT.toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              subContainer,
              {
                height: DESCRIPTION_CONTAINER_HEIGHT,
                backgroundColor: APP_COLOR_RED
              }
            ]}
            source={ABOUT_BACKGROUND_IMAGE}>
            <WebView
              source={{ html: HTML }}
              scrollEnabled={false}
              style={{ flex: 1, backgroundColor: 'transparent' }}
              ref={webView => (this.webView = webView)}
              onMessage={this.onMessage}
              onLoad={this.onWebViewLoad}
            />
          </View>
        </View>
      </ScrollView>
    );
  }
}
const styles = {
  container: {
    flex: 1,
    width: null,
    height: null,
    alignItems: 'center',
    backgroundColor: APP_COLOR_BLACK
  },
  subContainer: {
    backgroundColor: APP_COLOR_WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: LEFT_RIGHT_MARGINS,
    paddingEnd: LEFT_RIGHT_MARGINS,
    width: '100%'
  },
  aboutTextStyle: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED
  },
  aboutDescriptionTextStyle: {
    fontSize: DESCRIPTION_FONT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_WHITE,
    textAlign: 'center'
  },
  broughtToYouTextStyle: {
    fontSize: BROUGHT_TO_YOU_FONT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_BLACK,
    textAlign: 'center'
  },
  aboutDescriptionUnderlinedTextStyle: {
    fontSize: DESCRIPTION_FONT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_WHITE,
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  aboutIconStyle: {
    height: ABOUT_ICON_SIZE,
    width: ABOUT_ICON_SIZE,
    marginStart: 10,
    marginBottom: IF_OS_IS_IOS ? 10 : 0
  }
};
export default Payment;
