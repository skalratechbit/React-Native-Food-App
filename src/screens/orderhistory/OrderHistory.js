import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { List, ListItem, Button } from 'native-base';
import { APP_COLOR_WHITE, APP_COLOR_RED, APP_COLOR_BLACK }  from '../../config/colors';
import strings  from '../../config/strings/strings';
import { connect } from 'react-redux';
import { numberWithCommas } from '../../config/common_functions';
import { Actions } from 'react-native-router-flux';

import {  
          RIGHT_ARROW_LARGE_WHITE,
          ARROW_BOTTOM_WHITE,
          STAR_IMAGE,
           } from '../../assets/images'
import { DINENGSCHRIFT_REGULAR, HELVETICANEUE_LT_STD_CN, ROADSTER_REGULAR  } from '../../assets/fonts';
import {  IF_OS_IS_IOS,
          COMMON_BUTTON_RADIOUS,
          COMMON_BUTTON_TEXT_STYLE,
          FONT_SCALLING,
        } from '../../config/common_styles';
import _ from 'lodash';
import { actions } from '../../ducks/home';


const TITLE_CONTAINER_HEIGHT = 53.5;
const TITLE_FONT_SIZE = 30;
const LEFT_RIGHT_MARGINS = 20;
const BELL_ICON_WIDTH = 19;
const BELL_ICON_HEIGHT = 26;
const ITEM_CELL_HEIGHT = 90;
const ITEMS_MARGIN = 5;
const DESCRIPTION_TEXT_SIZE = 18;

const MARGIN_LEFT_RIGHT = 20;
const ITEM_TITLE_TEXT_SIZE = 25;

const GO_FOR_IT_BUTTON_WIDTH = 153;
const GO_FOR_IT_BUTTON_HEIGHT = 32;
const GO_FOR_IT_BUTTON_TEXT_SIZE = 17.5;

const DETAIL_CONTAINER_HEIGHT = 201.5;
const TOTAL_CONTAINER_HEIGHT = 142;
const TO_OPEN = "to open"
const orderHistoryList = [
        {
            "OrderID": "8",
            "Status": null,
            "OrderType": "Delivery",
            "AssignmentDate": "Monday, September 10, 2017",
            "ReturnDate": null,
            "SettlementDate": null,
            "FirstName": "John",
            "LastName": "Smith",
            "Mobile": "0096103123456",
            "Line1": "Beirut Hamra x1",
            "Line2": "Beirut h1",
            "City": null,
            "Province": null,
            "Apartment": "0",
            "Items": [
              {
                  "ID": "5476265",
                  "PLU": "229",
                  "ItemName": null,
                  "Quantity": "1",
                  "UnitPrice": "10750.00",
                  "GrossPrice": "10750.00"
              },
              {
                  "ID": "5476266",
                  "PLU": "1304",
                  "ItemName": null,
                  "Quantity": "1",
                  "UnitPrice": "5500.00",
                  "GrossPrice": "5500.00"
              },
              {
                  "ID": "5476267",
                  "PLU": "230",
                  "ItemName": null,
                  "Quantity": "1",
                  "UnitPrice": "10250.00",
                  "GrossPrice": "10250.00"
              },
              {
                  "ID": "5476268",
                  "PLU": "267",
                  "ItemName": null,
                  "Quantity": "1",
                  "UnitPrice": "11750.00",
                  "GrossPrice": "11750.00"
              }
          ],
            "Promotions": [],
            "isOpen": false
        },
        {
            "OrderID": "9",
            "Status": null,
            "OrderType": "Dine-In",
            "AssignmentDate": "Monday, September 10, 2017",
            "ReturnDate": null,
            "SettlementDate": null,
            "FirstName": "John",
            "LastName": "Smith",
            "Mobile": "0096103123456",
            "Line1": "Beirut Hamra x1",
            "Line2": "Beirut h1",
            "City": null,
            "Province": null,
            "Apartment": "0",
            "Items": null,
            "Promotions": [],
            "isOpen": false
        },
        {
            "OrderID": "10",
            "Status": null,
            "OrderType": "Delivery",
            "AssignmentDate": "Monday, September 10, 2017",
            "ReturnDate": null,
            "SettlementDate": null,
            "FirstName": "John",
            "LastName": "Smith",
            "Mobile": "0096103123456",
            "Line1": "Beirut Hamra x1",
            "Line2": "Beirut h1",
            "City": null,
            "Province": null,
            "Apartment": "0",
            "Items": null,
            "Promotions": [],
            "isOpen": false
        },
        {
            "OrderID": "11",
            "Status": null,
            "OrderType": "Delivery",
            "AssignmentDate": "Monday, September 10, 2017",
            "ReturnDate": null,
            "SettlementDate": null,
            "FirstName": "John",
            "LastName": "Smith",
            "Mobile": "0096103123456",
            "Line1": "Beirut Hamra x1",
            "Line2": "Beirut h1",
            "City": null,
            "Province": null,
            "Apartment": "0",
            "Items": [
              {
                  "ID": "5476265",
                  "PLU": "229",
                  "ItemName": null,
                  "Quantity": "1",
                  "UnitPrice": "10750.00",
                  "GrossPrice": "10750.00"
              },
              {
                  "ID": "5476266",
                  "PLU": "1304",
                  "ItemName": null,
                  "Quantity": "1",
                  "UnitPrice": "5500.00",
                  "GrossPrice": "5500.00"
              }
            ],
            "Promotions": [],
            "isOpen": false
        },
        {
            "OrderID": "12",
            "Status": null,
            "OrderType": "Dine-In",
            "AssignmentDate": "Monday, September 10, 2017",
            "ReturnDate": null,
            "SettlementDate": null,
            "FirstName": "John",
            "LastName": "Smith",
            "Mobile": "0096103123456",
            "Line1": "Beirut Hamra x1",
            "Line2": "Beirut h1",
            "City": null,
            "Province": null,
            "Apartment": "0",
            "Items": null,
            "Promotions": [],
            "isOpen": false
        },
        {
            "OrderID": "13",
            "Status": null,
            "OrderType": "Dine-In",
            "AssignmentDate": "Monday, September 10, 2017",
            "ReturnDate": null,
            "SettlementDate": null,
            "FirstName": "John",
            "LastName": "Smith",
            "Mobile": "0096103123456",
            "Line1": "Beirut Hamra x1",
            "Line2": "Beirut h1",
            "City": null,
            "Province": null,
            "Apartment": "0",
            "Items": null,
            "Promotions": [],
            "isOpen": false
        },
        {
            "OrderID": "14",
            "Status": null,
            "OrderType": "Delivery",
            "AssignmentDate": "Monday, September 10, 2017",
            "ReturnDate": null,
            "SettlementDate": null,
            "FirstName": "John",
            "LastName": "Smith",
            "Mobile": "0096103123456",
            "Line1": "Beirut Hamra x1",
            "Line2": "Beirut h1",
            "City": null,
            "Province": null,
            "Apartment": "0",
            "Items": null,
            "Promotions": [],
            "isOpen": false
        },
        {
            "OrderID": "15",
            "Status": null,
            "OrderType": "Delivery",
            "AssignmentDate": "Monday, September 10, 2017",
            "ReturnDate": null,
            "SettlementDate": null,
            "FirstName": "John",
            "LastName": "Smith",
            "Mobile": "0096103123456",
            "Line1": "Beirut Hamra x1",
            "Line2": "Beirut h1",
            "City": null,
            "Province": null,
            "Apartment": "0",
            "Items": null,
            "Promotions": [],
            "isOpen": false
        }
    ]

class OrderHistory extends Component{
  state = {
    orderHistoryList: orderHistoryList,
    componentTheme :{}
  };

    componentWillMount() {
        this.setThemeOfComponent();
    }
    setThemeOfComponent(){
        const theme	=  AsyncStorage.getItem('theme').then(data=>
            this.setState({componentTheme:JSON.parse(data)})
        );
    }
  componentDidMount() {
      this.setState({ orderHistoryList: this.props.historyData });

}
componentWillReceiveProps(nextProps){
 
}
    onPress  = ( event, caption, index ) => {
      switch (caption){

        case strings.ORDER_HISTORY:
          Actions.pop();
          break;

        case TO_OPEN:
          // alert(index);
          var historyArray = this.state.orderHistoryList;
          var selectedObj = historyArray[index];
          if (selectedObj.isOpen) {
            selectedObj.isOpen = false;
          }else{
            selectedObj.isOpen = true;
          }
          this.setState({orderHistoryList: _.cloneDeep(historyArray)});
          break;



        default:
      };
    };

    total = ( array ) => {
      var result = 0;
      for (var i = 0; i < array.length; i++) {
          result += parseInt(array[i].GrossPrice);
      }
            return result;

          }
  render() {
    const { container,
            subContainer,
            detailRowStyle,
            listContainer,
            aboutTextStyle,
            DetailsTextStyle,
            starsTextStyle,
            totalStarsTextStyle,
            goForItButtonStyle,
            starImageStyle,
            replicateTextStyle,
            titleArrowImageStyle,
            listItemTitleTextStyle,
            descriptionTextStyle,
            listItemContainer,
            innerViewStyle,
            totalAmountTextStyle,
            arrowImageStyle,
            arrowDownImageStyle,
              } = styles;

    return (
                <View style = { [container ,{backgroundColor: this.state.componentTheme.thirdColor } ]}>
                  <View style={[ subContainer, { height: TITLE_CONTAINER_HEIGHT } ]}>
                    <TouchableOpacity onPress={ (event) => this.onPress( event, strings.ORDER_HISTORY ) }
                        style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={ titleArrowImageStyle } source={ this.state.componentTheme.ARROW_LEFT_RED }/>
                        <Text allowFontScaling={FONT_SCALLING}
                              style={ [aboutTextStyle, {color:this.state.componentTheme.thirdColor}  ]}>
                          { strings.ORDER_HISTORY.toUpperCase() }
                        </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[listContainer ,{backgroundColor: this.state.componentTheme.thirdColor } ] }>

                      <List bounces={ false } horizontal={false} dataArray={this.state.orderHistoryList} style={{flex: 1 }}
                          renderRow={(item, sectionID, rowID, highlightRow) =>
                              <ListItem style={ listItemContainer }>
                                      <TouchableOpacity onPress={ (event) => this.onPress( event, TO_OPEN, rowID ) }
                                          style={{ flex: 1, width: '100%', height: ITEM_CELL_HEIGHT, justifyContent: 'center' }}>
                                          <View>
                                            <Text allowFontScaling={FONT_SCALLING}
                                                  style={ listItemTitleTextStyle }>
                                              {item.FullOrderDate?item.FullOrderDate.toUpperCase(): 'Unspecified'   }
                                            </Text>
                                            <Text allowFontScaling={FONT_SCALLING}
                                                  style={ descriptionTextStyle }>{ item.OrderType }</Text>
                                            {item.isOpen?
                                              <Image style={ arrowDownImageStyle }source={ ARROW_BOTTOM_WHITE }/>
                                            :
                                              <Image style={ arrowImageStyle }source={ RIGHT_ARROW_LARGE_WHITE }/>
                                            }


                                          </View>
                                      </TouchableOpacity>
                                      {item.isOpen &&
                                        <View style={{ width: '100%' }}>
                                          {
                                            ( item.items !== undefined && item.items !== null) ?

                                             item.items.map((data, i) => (
                                               <View key={i} style={{ backgroundColor: APP_COLOR_BLACK, paddingStart: MARGIN_LEFT_RIGHT, paddingEnd: MARGIN_LEFT_RIGHT }}>
                                                 <View style={ detailRowStyle }>
                                                   <View style={{ width: '60%'}}>
                                                     <Text  allowFontScaling={FONT_SCALLING}
                                                            style={ DetailsTextStyle }>
                                                         {(data.ItemName !== null)? data.ItemName.toUpperCase() + ':' : 'undefined' + ':' }
                                                     </Text>
                                                   </View>
                                                   <View style={{ width: '40%', alignItems: 'flex-end'}}>
                                                     <Text  allowFontScaling={FONT_SCALLING}
                                                            style={ DetailsTextStyle }>
                                                        {(data.GrossPrice !== null)? numberWithCommas(data.GrossPrice.toUpperCase(), this.props.currency)  : 'undefined'  }
                                                     </Text>
                                                     <View style={{ flexDirection: 'row',justifyContent:'center',alignItems:'center',borderColor:'red', }}>
                                                       <Text  allowFontScaling={FONT_SCALLING}
                                                              style={ starsTextStyle }>
                                                           {  Math.round(data.GrossPrice/1000) + " " + strings.STARS }
                                                       </Text>
                                                       <Image style={starImageStyle}
                                                           source={ STAR_IMAGE }/>
                                                     </View>
                                                   </View>
                                                 </View>
                                               </View>
                                                  ))
                                                :
                                                null
                                            }



                                      { ( item.items !== undefined && item.items !== null) ?

                                          <View style={[ innerViewStyle, {  height: TOTAL_CONTAINER_HEIGHT,
                                                                            backgroundColor: APP_COLOR_WHITE,
                                                                            flexDirection: 'column', } ]}>
                                            <View style={ detailRowStyle }>
                                              <View style={{ width: '60%'}}>
                                                <Text allowFontScaling={FONT_SCALLING}
                                                      style={[ totalAmountTextStyle, { color: this.state.componentTheme.thirdColor } ]}>
                                                    { strings.TOTAL_AMOUNT.toUpperCase() + ":" }
                                                </Text>
                                              </View>
                                              <View style={{ width: '40%', alignItems: 'flex-end'}}>
                                                <Text allowFontScaling={FONT_SCALLING}
                                                      style={[ totalAmountTextStyle, { color: this.state.componentTheme.thirdColor } ]}>
                                                  {

                                                   numberWithCommas(this.total(item.items), this.props.currency)
                                                  }
                                                    {/* { "70,000" + " " + strings.LBP } */}
                                                </Text>
                                                <View style={{ flexDirection: 'row' }}>
                                                  <Text allowFontScaling={FONT_SCALLING}
                                                        style={[ totalStarsTextStyle, { color: this.state.componentTheme.thirdColor } ]}>
                                                      { Math.round(this.total(item.items)/1000) + " " + strings.STARS }
                                                  </Text>
                                                  <Image style={[ starImageStyle ]}
                                                      source={ this.state.componentTheme.STAR_RED_IMAGE }/>
                                                </View>
                                              </View>
                                            </View>
                                            <View style={[ detailRowStyle, {height: 35 } ]}>
                                              <View style={{ width: '50%'}}>
                                                <Text allowFontScaling={FONT_SCALLING}
                                                      style={[ replicateTextStyle, { color: this.state.componentTheme.thirdColor } ]}>
                                                    { strings.REPLICATE_ORDER.toUpperCase() + ":" }
                                                </Text>
                                              </View>
                                              <View style={{ width: '50%',  justifyContent: 'flex-end'}}>

                                                  <Button   onPress={ (event) => this.onPress( event, strings.GO_FOR_IT ) }
                                                            style={[ goForItButtonStyle, { backgroundColor: this.state.componentTheme.thirdColor } ]}>
                                                    <Text allowFontScaling={FONT_SCALLING}
                                                          style={ [COMMON_BUTTON_TEXT_STYLE, {fontFamily: ROADSTER_REGULAR, fontSize: GO_FOR_IT_BUTTON_TEXT_SIZE }] }>
                                                      { strings.GO_FOR_IT.toUpperCase() }
                                                    </Text>
                                                  </Button>
                                              </View>
                                            </View>

                                          </View>


                                      :
                                      null
                                    }

                                        </View>
                                    }
                              </ListItem>
                          }>
                      </List>

                  </View>

                </View>
    );
  }
}
const styles = {
  container: {
    flex: 1,
    width: null,
    height: null,
    alignItems: 'center',
    backgroundColor: APP_COLOR_BLACK,
  },
  subContainer: {
    backgroundColor: APP_COLOR_WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: LEFT_RIGHT_MARGINS,
    paddingEnd: LEFT_RIGHT_MARGINS,
    width: '100%',
  },
  aboutTextStyle: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED
  },
  aboutIconStyle: {
    height: BELL_ICON_HEIGHT,
    width: BELL_ICON_WIDTH,
    marginStart: 10
  },
  listContainer: {
    flex: 1,
    backgroundColor: APP_COLOR_RED,
    width: '100%',
  },
  listItemContainer: {
    // height: ITEM_CELL_HEIGHT + DETAIL_CONTAINER_HEIGHT,
    flexDirection: 'column',
    marginLeft: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 0,
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: IF_OS_IS_IOS ? 0 : 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: ITEMS_MARGIN
  },
  listItemTitleTextStyle: {
    color: APP_COLOR_BLACK,
    marginStart: MARGIN_LEFT_RIGHT,
    fontSize: ITEM_TITLE_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
  },
  descriptionTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: DESCRIPTION_TEXT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    marginStart: MARGIN_LEFT_RIGHT
  },
  arrowImageStyle:{
    width: 11,
    height: 18,
    marginTop: IF_OS_IS_IOS ? 15 : 15,
    position: 'absolute',
    right: MARGIN_LEFT_RIGHT
  },
  arrowDownImageStyle:{
    width: 18.5,
    height: 10.5,
    marginTop: IF_OS_IS_IOS ? 15 : 15,
    position: 'absolute',
    right: MARGIN_LEFT_RIGHT
  },
  titleArrowImageStyle:{
      marginStart: 0,
      marginEnd: 5,
      marginBottom:IF_OS_IS_IOS?10:0
  },
  innerViewStyle: {
    alignItems: 'center',
    paddingStart: LEFT_RIGHT_MARGINS,
    paddingEnd: LEFT_RIGHT_MARGINS,
    width: '100%',
    height: DETAIL_CONTAINER_HEIGHT,
    backgroundColor: APP_COLOR_BLACK,
    justifyContent: 'center',
    flexDirection: 'column'
  },
  DetailsTextStyle: {
      fontSize: 23,
      fontFamily: DINENGSCHRIFT_REGULAR,
      color: APP_COLOR_WHITE
  },
  totalAmountTextStyle: {
    fontSize: 30,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED
  },
  starsTextStyle: {
      textAlign: 'right',
      color: APP_COLOR_WHITE,
      fontSize: 15.5,
      fontFamily: HELVETICANEUE_LT_STD_CN
  },
  totalStarsTextStyle: {
      textAlign: 'right',
      color: APP_COLOR_RED,
      fontSize: 18,
      fontFamily: HELVETICANEUE_LT_STD_CN
  },
  starImageStyle:{
      alignSelf: 'center',
      marginStart: 3,
      width: 20, height: 20,
      marginTop: IF_OS_IS_IOS?-10:0,
  },
  detailRowStyle: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 10
  },
  replicateTextStyle: {
    fontSize: 25,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED
  },
  goForItButtonStyle:{
      backgroundColor: APP_COLOR_RED,
      width: GO_FOR_IT_BUTTON_WIDTH,
      height: GO_FOR_IT_BUTTON_HEIGHT,
      alignItems: 'center',
      position: 'absolute',
      paddingBottom: IF_OS_IS_IOS ?9: 7,
      justifyContent: 'center',
      alignSelf: 'flex-end',
      borderRadius: COMMON_BUTTON_RADIOUS,
  },
};

function mapStateToProps(state){
  // //console.log("OrderHistory", state.home);

    return {  historyData: state.home.userOrdersCount,
              currency : state.app.currency };
}

export default  connect (mapStateToProps, actions) (OrderHistory);
