import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import CommonLoader from '../../components/CommonLoader';
import { connect } from 'react-redux';
import { IF_OS_IS_IOS } from '../../config/common_styles';
import { BASE_DOMAIN, ORGANIZATION_ID } from '../../config/constants/network_constants';
import { Actions } from 'react-native-router-flux';
import { actions as deliveryDetailsAction } from '../../ducks/deliverydetails';
import { actions as homeActions } from '../../ducks/home';
import { actions as appstateAction } from '../../ducks/setappstate';
import { bindActionCreators } from 'redux';
import { getUserObject } from '../../helpers/UserHelper';
import CommonPopup from '../../components/Common/CommonPopup';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import HTML from './PaymentViewHtml';

const EXPECTING_TEXT_SIZE = 30;
const SKIP_TEXT_SIZE = 21;

class PaymentView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      visibilty: false,
      themeColor: getThemeByLevel(this.props.LevelName).thirdColor,
      statusHeading: 'SUCCESS!',
      statusMessage: 'Your bill has been settled!',
      statusPopupVisibility: false,
      isLoading: true
    };
  }

  onWebViewLoad = event => {
    this.setLoading(true);
  };

  onWebViewLoadEnd = event => {
    this.setLoading(false);
  }

  setLoading(value) {
    this.setState({ isLoading: value });
  }

  cancelOrder () {
    const { CustomerId, ACCESS_TOKEN, agoraOrderId } = this.props;
    if(agoraOrderId) {
      const formdata = new FormData();
      formdata.append('token', ACCESS_TOKEN);
      formdata.append('organization_id', ORGANIZATION_ID);
      formdata.append('OrderId', agoraOrderId);
      formdata.append('CustomerId', CustomerId);
      console.log('Cancelling Order', formdata)
      this.props.cancelOrder(formdata);
    }
  }

  onMessage = event => {
    const { nativeEvent: { data } } = event;
    const { returnView } = this.props;

    console.log('On Message', data);

    switch(data) {
      case 'loading':
        this.setLoading(true);
      break;
      case 'loaded':
        this.setLoading(false);
      break;
      case 'success':
        this.sendTransaction();
      break;
      case 'cancelled':
        this.cancelOrder()
        this.setState({
          statusHeading: 'UH-OH!',
          statusMessage: 'You cancelled your transaction.',
          statusPopupVisibility: true
        })
      break;
      default:
        this.setState({
          statusHeading: 'UH-OH!',
          statusMessage: 'There was a problem processing your transaction!',
          statusPopupVisibility: true
        })
      break;
    }
  };

  sendTransaction() {
    const { paymentFormDataParams, onlineAmount, paymentKey } = this.props;
    const { orderID } = this.props;
    const formdata = paymentFormDataParams;
    // console.log('=================> SENDING ORDER FORM', formdata);
    if(formdata) {
      formdata.append('paymentParts[0][' + paymentKey + ']', orderID);
      formdata.append('paymentParts[0][Settlement]', onlineAmount);
    }
    this.setState({
      isLoading: false,
      statusHeading: 'SUCCESS!',
      statusMessage: 'Your bill has been settled!',
      statusPopupVisibility: true
    }, () => {
      this.props.submitTransaction(formdata);
    });
  }

  closeSuccessPopup = () => {
    this.setState({ statusPopupVisibility: false, isLoading: false });
    const { statusHeading } = this.state
    const { returnView, successView } = this.props;
    Actions[(statusHeading === 'SUCCESS!' && successView) || returnView || 'yourcart']();
  }

  setWebViewRef = (webView) => {
    this.webView = webView;
  }

  render() {
    const { webViewContainerStyle, webViewStyle } = styles;

    const patchPostMessageFunction = function() {
      const originalPostMessage = window.postMessage;
      const patchedPostMessage = function(message, targetOrigin, transfer) {
        originalPostMessage(message, targetOrigin, transfer);
      };
      patchedPostMessage.toString = function() {
        return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
      };
      window.postMessage = patchedPostMessage;
    };
    const patchPostMessageJsCode = `(${String(patchPostMessageFunction)})();`;

    const { CustomerId, onlineAmount, loadingState, orderID, ACCESS_TOKEN, expressPayment, agoraOrderId, agoraPaymentId } = this.props;
    const SubTotal = Number(onlineAmount) / 1500;
    const Amount = SubTotal.toFixed(2);
    const { statusHeading, statusMessage, statusPopupVisibility, themeColor, isLoading } = this.state;
    const EXPRESS_PAYMENT = JSON.stringify(expressPayment);
    const CLIENT_HTML = HTML.replace('ACCESS_TOKEN', ACCESS_TOKEN)
      //==> for debugging
      // .replace('https://bobsal', 'https://test-bobsal')
      // .replace(/'RD'/, "'ROADSTER02'")
      //==> /for debugging
      .replace(/EXPRESS_PAYMENT/g, EXPRESS_PAYMENT)
      .replace(/ORGANIZATION_ID/g, ORGANIZATION_ID)
      .replace(/CUSTOMER_ID/g, CustomerId)
      .replace(/AMOUNT/g, Amount)
      .replace(/AGORA_ORDER_ID/g, agoraOrderId)
      .replace(/AGORA_PAYMENT_ID/g, agoraPaymentId)
      .replace(/ORDER_ID/g, orderID);
    const QUERY_STRING = `?token=${ACCESS_TOKEN}&organization_id=${ORGANIZATION_ID}&customer_id=${CustomerId}&amount=${Amount}&order_id=${orderID}&agora_order_id=${agoraOrderId}&agora_payment_id=${agoraPaymentId}&express_payment=${encodeURI(EXPRESS_PAYMENT)}`;
    const GATEWAY_URL = `${BASE_DOMAIN}gateway/${QUERY_STRING}`;
    console.log('GATEWAY_URL', GATEWAY_URL)

    return (
      <View>
        <CommonLoader isLoading={isLoading} />
        <View style={webViewContainerStyle}>
          <WebView
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 9_3 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13E233 Safari/601.1"
            ref={this.setWebViewRef}
            javaScriptEnabled={true}
            scrollEnabled={true}
            mixedContentMode='always'
            allowUniversalAccessFromFileURLs={true}
            source={IF_OS_IS_IOS ? { html: CLIENT_HTML} : { uri: GATEWAY_URL }}
            style={webViewStyle}
            onMessage={this.onMessage}
            injectedJavaScript={patchPostMessageJsCode}
            onLoad={this.onWebViewLoad}
            onLoadEnd={this.onWebViewLoadEnd}
            scalesPageToFit={false}
            bounces={false}
          />
        </View>
        <CommonPopup
          onClose={this.closeSuccessPopup}
          color={themeColor}
          visibilty={!loadingState && statusPopupVisibility}
          heading={statusHeading}
          subbody={statusMessage}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  webViewContainerStyle: {
    width: '100%',
    height: '100%'
  },
  webViewStyle: { flex: 1, backgroundColor: 'transparent' }
});

function mapStateToProps(state) {
  const userData = getUserObject(state);
  const ACCESS_TOKEN = state.app.accessToken;
  return {
    ACCESS_TOKEN,
    loadingState: state.app.loading,
    CustomerId: userData.CustomerId || 0,
    LevelName: userData.LevelName
  };
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...homeActions,
      ...appstateAction,
      ...deliveryDetailsAction
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentView);
//export default PaymentView;
