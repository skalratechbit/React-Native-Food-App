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
      isLoading: true,
      didSucceed: false
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

  onMessage = event => {
    const { nativeEvent: { data } } = event;
    const { returnView } = this.props;

    console.log('On Message', data);
  };

  closeSuccessPopup = () => {
    const { didSucceed } = this.state
    this.setState({ statusPopupVisibility: false, isLoading: false })
    const { returnView, successView, OrderId } = this.props
    Actions[didSucceed ? successView : returnView]({
      viewingOrder: String(OrderId),
      hideRecommended: true
    })
  };

  setWebViewRef = (webView) => {
    this.webView = webView;
  }

  handleNavigationChange = e => {
    // console.log('Navigation change', e)
    const { url } = e
    const hasFailed = url.match('Status=fail') // failed
    const hasSuccess = url.match('Status=success')
    if (hasSuccess && !hasFailed) {
      this.setState({
        didSucceed: true,
        isLoading: false,
        statusHeading: 'SUCCESS!',
        statusMessage: 'Your bill has been settled!',
        statusPopupVisibility: true
      })
    }
    if (hasFailed) {
      this.setState({
        didSucceed: false,
        statusHeading: 'UH-OH!',
        statusMessage: 'There was a problem processing your transaction!',
        statusPopupVisibility: true
      })
    }
  };

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

    const { loadingState, url } = this.props
    const {
      statusHeading,
      statusMessage,
      statusPopupVisibility,
      isLoading,
      themeColor
    } = this.state

    return (
      <View>
        <CommonLoader isLoading={isLoading} />
        <View style={webViewContainerStyle}>
          <WebView
            userAgent='Mozilla/5.0 (iPhone; CPU iPhone OS 9_3 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13E233 Safari/601.1'
            ref={this.setWebViewRef}
            javaScriptEnabled
            mixedContentMode='always'
            allowUniversalAccessFromFileURLs
            source={{ uri: url }}
            style={webViewStyle}
            onMessage={this.onMessage}
            injectedJavaScript={patchPostMessageJsCode}
            onLoad={this.onWebViewLoad}
            onLoadEnd={this.onWebViewLoadEnd}
            onNavigationStateChange={this.handleNavigationChange}
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
