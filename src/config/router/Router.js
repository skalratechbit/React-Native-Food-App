import React, { Component } from 'react';
import { Scene, Router, Stack, Drawer } from 'react-native-router-flux';
import { Dimensions } from 'react-native';
import DrawerContent from './DrawerContent';
import NavigationBar from '../../components/NavigationBar';
import Splash from '../../screens/splash/Splash';
import Welcome from '../../screens/welcome/Welcome';
import Competition from '../../screens/competition/Competition';

import Register from '../../screens/register/Register';
import Pincode from '../../screens/pincode/Pincode';
import Join from '../../screens/join/Join';
import Home from '../../screens/home/Home';
import OurMenu from '../../screens/ourmenu/OurMenu';
import Categories from '../../screens/categories/Categories';
import Customize from '../../screens/categories/Customize';
import YourCart from '../../screens/yourcart/YourCart';
import EditOrder from '../../screens/editorder/EditOrder';
import DeliveryDetails from '../../screens/deliverydetails/DeliveryDetails';
import Favorites from '../../screens/favorites/Favorites';
import About from '../../screens/about/About';
import Notifications from '../../screens/notifications/Notifications';
import OrderHistory from '../../screens/orderhistory/OrderHistory';
import WeAreAt from '../../screens/at/WeAreAt';
import AtDetail from '../../screens/at/AtDetail';
import BoostYourStars from '../../screens/boost_your_stars/BoostYourStars';
import TrackOrder from '../../screens/track_order/TrackOrder';
import SquadCorner from '../../screens/squadcorner/SquadCorner';

import QRCodeScannedBill from '../../screens/squadcorner/QRCodeScannedBill';
import QRCodeScanner from '../../screens/squadcorner/QRCodeScanner';
import SquadCornerDetail from '../../screens/squadcorner/SquadCornerDetail';
import EditProfile from '../../screens/edit_profile/EditProfile';
import WheelGame from '../../screens/wheel_game/WheelGame';
import PaymentView from '../../screens/paymentview/Index';
import PaymentViewLegacy from '../../screens/paymentview/PaymentViewLegacy';
import Vouchers from '../../screens/vouchers/Vouchers';
import Contact from '../../screens/contact/Contact';
import Recommended from '../../screens/recommended/Recommended';
import MyOrders from '../../screens/orderhistory/MyOrders';
import Update from '../../screens/update/UpdateScreen';

import { connect } from 'react-redux';

const SCREEN_WIDTH = Dimensions.get('window').width;
class RouterComponent extends Component {
  screenInterpolator(props) {
    const { scene } = props;
    switch (scene.route.routeName) {
      default:
    }
  }
  transitionConfig() {
    return {
      //screenInterpolator: this.screenInterpolator
    };
  }
  render() {
    return (
      <Router sceneStyle={{ shadowColor: 'transparent' }} hideNavBar={false} navTransparent={true}>
        <Stack key="root" hideNavBar transitionConfig={this.transitionConfig}>
          <Drawer
            navTransparent
            navBar={NavigationBar}
            hideNavBar={false}
            contentComponent={DrawerContent}
            drawerWidth={SCREEN_WIDTH}
            left
            right
            center
            key="drawer">

            <Scene key="home" component={Home} hideNavBar navBar={NavigationBar} initial />
            <Scene key="deliverydetails" component={DeliveryDetails} hideNavBar />
            <Scene key="ourmenu" component={OurMenu} hideNavBar />
            <Scene key="categories" component={Categories} hideNavBar />
            <Scene key="yourcart" component={YourCart} hideNavBar />
            <Scene key="customize" component={Customize} hideNavBar />
            <Scene key="editorder" component={EditOrder} hideNavBar />
            <Scene key="about" component={About} hideNavBar />
            <Scene key="notifications" component={Notifications} hideNavBar />
            <Scene key="orderhistory" component={OrderHistory} hideNavBar />
            <Scene key="myorders" component={MyOrders} hideNavBar />
            <Scene key="weareat" component={WeAreAt} hideNavBar />
            <Scene key="atdetail" component={AtDetail} hideNavBar />
            <Scene key="boost_your_stars" component={BoostYourStars} hideNavBar />
            <Scene key="track_order" component={TrackOrder} hideNavBar />
            <Scene key="squadcorner" component={SquadCorner} hideNavBar />
            <Scene key="squadcorner_details" component={SquadCornerDetail} hideNavBar/>
            <Scene key="qrcodescannedbill" component={QRCodeScannedBill} hideNavBar />
            <Scene key="qrcodescanner" component={QRCodeScanner} hideNavBar />
            <Scene key="edit_profile" component={EditProfile} hideNavBar />
            <Scene key="wheel_game" component={WheelGame} hideNavBar />
            <Scene key="paymentview" component={PaymentView} hideNavBar />
            <Scene key="paymentviewlegacy" component={PaymentViewLegacy} hideNavBar />
            <Scene key="vouchers" component={Vouchers} hideNavBar />
            <Scene key="contact" component={Contact} hideNavBar />
            <Scene key="recommended" component={Recommended} hideNavBar />
            <Scene key="favorites" component={Favorites} hideNavBar />
            <Scene key="competitions" component={Competition} hideNavBar />
          </Drawer>
          <Scene key="splash" component={Splash} initial type='replace'/>
          <Scene key="welcome" component={Welcome}/>
          <Scene key="register" component={Register}/>
          <Scene key="pincode" component={Pincode}/>
          <Scene key="join" component={Join}/>
          <Scene key="update" component={Update} type='replace'/>
          <Scene key="squadcorner_details" component={SquadCornerDetail} type='replace'/>
          {/*<Scene key="update" component={Update} type='replace'/>*/}
          {/*<Scene key="update" component={Join}/>*/}
        </Stack>
      </Router>
    );
  }
}

export default RouterComponent;
