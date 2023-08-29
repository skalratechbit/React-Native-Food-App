import React, { Component } from 'react'
import {
  View,
  Modal,
  ActivityIndicator,
  Text,
  Image,
  TouchableOpacity
} from 'react-native'
import { Spinner } from 'native-base'
import strings from '../../config/strings/strings'
import {
  LOADER_BACKGROUND,
  APP_COLOR_WHITE,
  APP_COLOR_RED,
  APP_COLOR_BLACK
} from '../../config/colors'
import {
  DINENGSCHRIFT_REGULAR,
  ROADSTER_REGULAR,
  HELVETICANEUE_LT_STD_CN
} from '../../assets/fonts'
import {
  HOME_DRAWER_IMAGE,
  POPCROSS_IC,
  ITEM1,
  ITEM2,
  ITEM3,
  ITEM4,
  ITEM5,
  ITEM6
} from '../../assets/images'
import {
  COMMON_INPUT_STYLE,
  COMMON_INPUT_TEXT_STYLE,
  FONT_SCALLING
} from '../../config/common_styles'
import { connect } from 'react-redux'
const ICON_SIZE = 31
const ICON_VIEW_SIZE = 60
const TEXT_LEFT_MARGIN = 65
const TEXT_SIZE = 25
const REGISTER_TEXT_SIZE = 8
const BUTTON_HEIGHT = 53
const ICONS_MARGIN = 16
const LINE_HEIGHT = 0.5

const styles = {
  containerStyle: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
    backgroundColor: APP_COLOR_BLACK
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000099'
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  headingViewStyle: {
    backgroundColor: APP_COLOR_RED,
    padding: 18
  },
  popUpContainerView: {
    borderRadius: 10,
    borderWidth: 0,
    width: 300,
    overflow: 'hidden'
  },
  headingTextStyle: {
    fontSize: 35,
    fontFamily: DINENGSCHRIFT_REGULAR,
    alignSelf: 'center',
    color: APP_COLOR_WHITE,
    marginTop: 7,
    textAlign: 'center'
  },
  subHeadingStyle: {
    fontSize: 25,
    fontFamily: DINENGSCHRIFT_REGULAR,
    alignSelf: 'center',
    color: APP_COLOR_RED
  },
  detailTextStyle: {
    fontSize: 18,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    alignSelf: 'center',
    color: APP_COLOR_BLACK,
    textAlign: 'center',
    marginStart: 10,
    marginEnd: 10,
    marginTop: 20
  },
  crossImageStyle: {
    width: 18,
    height: 18
    // resizeMode:'contain',
  },
  crossImageTouchStyle: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 8,
    top: 5
  },

  bottomviewStyle: {
    height: 40,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageContainerStyle: {
    width: 150,
    height: 106
    // resizeMode:'contain'
  },
  itemImageStyle: {
    width: 152,
    height: 110
    // resizeMode:'contain',
  }
}

class FreeStartersPopUp extends Component {
  state = {
    modalVisibilty: false,
    apiname: '',
    freeItemsDataArray: [
      { image: ITEM1, item: 1, datamargin: 0 },
      { image: ITEM2, item: 1, datamargin: 4 },
      { image: ITEM3, item: 1, datamargin: 0 },
      { image: ITEM4, item: 1, datamargin: 4 },
      { image: ITEM5, item: 1, datamargin: 0 },
      { image: ITEM6, item: 1, datamargin: 4 }
    ]
  };
  componentWillReceiveProps (nextProps) {
    this.setState({ modalVisibilty: nextProps.modalVisibilty })
  }

  handleRequestClose () {}

  render () {
    return (
      <Modal
        transparent
       
        visible={this.state.modalVisibilty}
        onRequestClose={this.handleRequestClose}
      >
        <View style={styles.modalBackground}>
          <View style={styles.popUpContainerView}>
            <View
              style={[
                styles.headingViewStyle,
                { backgroundColor: APP_COLOR_WHITE }
              ]}
            >
              <TouchableOpacity
                onPress={this.props.onCrossPress}
                style={styles.crossImageTouchStyle}
              >
                <Image style={styles.crossImageStyle} source={POPCROSS_IC} />
              </TouchableOpacity>
            </View>

            <View style={styles.activityIndicatorWrapper}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {this.state.freeItemsDataArray.map((value, i) => (
                  <View key={i} style={[styles.imageContainerStyle]} key={i}>
                    <View style={{ flexDirection: 'row' }}>
                      {(i == 3 || i == 5 || i == 1) && (
                        <View
                          style={{
                            height: 110,
                            width: 2,
                            backgroundColor: APP_COLOR_WHITE
                          }}
                        />
                      )}
                      <Image
                        style={styles.itemImageStyle}
                        source={value.image}
                      />
                    </View>
                  </View>
                ))}
              </View>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[
                  styles.detailTextStyle,
                  { color: this.props.appTheme.thirdColor, textAlign: 'center' }
                ]}
              >
                SELECT ONE OF THESE AND
              </Text>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[
                  styles.subHeadingStyle,
                  { color: this.props.appTheme.thirdColor }
                ]}
              >
                GET IT FOR FREE
              </Text>
            </View>
            <View
              style={[
                styles.bottomviewStyle,
                { backgroundColor: this.props.appTheme.thirdColor }
              ]}
            >
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[
                  styles.detailTextStyle,
                  { color: APP_COLOR_WHITE, textAlign: 'center', marginTop: 5 }
                ]}
              >
                Valid for one month
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
}
function mapStateToProps (state) {
  // console.log(state);
  return { apiname: state.app.apiname, loadingState: state.app.loading }
}

export default connect(
  null,
  null
)(FreeStartersPopUp)
