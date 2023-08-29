import React, { Component } from 'react';
import {
  View,
  Modal,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  APP_COLOR_WHITE,
  APP_COLOR_RED,
  APP_COLOR_BLACK
} from '../../config/colors';
import {
  DINENGSCHRIFT_REGULAR,
  HELVETICANEUE_LT_STD_CN
} from '../../assets/fonts';
import { POPCROSS_IC } from '../../assets/images';
import {
  FONT_SCALLING,
} from '../../config/common_styles';
import {
  showKeyBoardEventHandler,
  hideKeyBoardEventHandler
} from '../../config/common_functions';
import strings from '../../config/strings/strings';

const ICON_SIZE = 31;
const ICON_VIEW_SIZE = 60;
const TEXT_LEFT_MARGIN = 65;
const TEXT_SIZE = 25;
const REGISTER_TEXT_SIZE = 8;
const BUTTON_HEIGHT = 53;
const ICONS_MARGIN = 16;
const LINE_HEIGHT = 0.5;

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
    justifyContent: 'space-around',
    paddingBottom: 15
  },
  contactsListStyle: {
    flexDirection: 'row',
    marginStart: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headingViewStyle: {
    backgroundColor: APP_COLOR_RED,
    padding: 15,
    marginTop: 40,
    overflow: 'hidden',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  popUpContainerView: {
    borderRadius: 10,
    borderWidth: 0,
    width: '80%',
    overflow: 'hidden',
    marginTop: 50,
    marginBottom: 100
  },
  headingTextStyle: {
    fontSize: 35,
    fontFamily: DINENGSCHRIFT_REGULAR,
    alignSelf: 'center',
    color: APP_COLOR_WHITE,
    marginTop: 7
  },
  subHeadingStyle: {
    fontSize: 25,
    fontFamily: DINENGSCHRIFT_REGULAR,
    alignSelf: 'center',
    color: APP_COLOR_RED,
    marginTop: 15
  },
  detailTextStyle: {
    fontSize: 18,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    alignSelf: 'center',
    color: APP_COLOR_BLACK,
    textAlign: 'center',
    marginStart: 10,
    marginEnd: 10,
    marginBottom: 10,
    marginTop: 5
  },
  crossImageStyle: {
    width: 18,
    height: 18,
    resizeMode: 'contain'
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
  rotateArrowImageStyle: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginStart: 50
  },
  rotateTextstyle: {
    color: APP_COLOR_WHITE,
    fontSize: 24,
    fontFamily: DINENGSCHRIFT_REGULAR,
    marginEnd: 50
  },
  searcBarStyle: {
    backgroundColor: 'red',
    height: 50,
    color: APP_COLOR_WHITE,
    fontSize: 25,
    textAlign: 'center',
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  contactTextStyle: {
    marginTop: -1,
    textAlign: 'center',
    borderWidth: 0,
    width: '100%',
    height: 20,
    marginTop: 10
  }
};

class ContactViewPopUp extends Component {
  state = {
    modalVisibilty: false,
    apiname: '',
    contactsArray: [],
    searchString: ''
  };

  componentWillReceiveProps(nextProps) {
    const state = { modalVisibilty: nextProps.modalVisibilty, contactsArray: nextProps.contacts };
    if (nextProps.modalVisibilty && !this.props.modalVisibilty && this.inputRef) {
      setTimeout(() => this.inputRef.focus(), 2e3);
    } else if (!nextProps.modalVisibilty && this.props.modalVisibilty) {
      state.searchString = '';
    }
    this.setState(state);
  }
  keyboardDidHide = () => {
    hideKeyBoardEventHandler(this.refs.scrollView);
  };

  keyboardDidShow = () => {
    showKeyBoardEventHandler(this.refs.scrollView);
  };

  componentWillMount() {
   
  }

  onChangeText(searchString) {
    if (searchString == '') {
      this.setState({ contactsArray: this.props.contacts, searchString: searchString });
    } else {
      const filterArray = this.props.contacts.filter(obj =>
        obj.displayName.toLowerCase().includes(searchString.toLowerCase())
      );
      this.setState({ contactsArray: filterArray, searchString: searchString });
    }
  }

  onSelect(obj) {
    this.setState({ searchString: '' });
    this.props.setSelectedObject(null, obj);
  }

  handleRequestClose() {}

  render() {
    const { contactsArray, modalVisibilty, searchString } = this.state;
    return (
      <Modal
        transparent={true}
        visible={modalVisibilty}
        onRequestClose={this.handleRequestClose}>
        <View style={styles.modalBackground}>
          <View style={styles.popUpContainerView}>
            <View
              style={[
                styles.headingViewStyle,
                { backgroundColor: this.props.appTheme.thirdColor }
              ]}>
              <TouchableOpacity
                onPress={this.props.onCrossPress}
                style={styles.crossImageTouchStyle}>
                <Image style={styles.crossImageStyle} source={POPCROSS_IC} />
              </TouchableOpacity>
            </View>
            <TextInput
              ref={ref => (this.inputRef = ref)}
              autoFocus={true}
              onChangeText={searchString => {
                this.onChangeText(searchString);
              }}
              value={searchString}
              underlineColorAndroid="transparent"
              placeholder="Search Here"
              style={[styles.searcBarStyle, { backgroundColor: this.props.appTheme.thirdColor }]}
            />
            <ScrollView ref="scrollView">
              <View style={styles.activityIndicatorWrapper}>
                {contactsArray.map((obj, j) => (
                  <View key={j} style={styles.contactsListStyle}>
                    <TouchableOpacity
                      onPress={() => this.onSelect(obj)}
                      style={{ borderWidth: 0, justifyContent: 'center', alignItems: 'center' }}>
                      <Text allowFontScaling={FONT_SCALLING} style={styles.contactTextStyle}>
                        {obj.displayName}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {contactsArray.length == 0 ? (
                  <View style={styles.contactsListStyle}>
                    <Text allowFontScaling={FONT_SCALLING} style={[styles.contactTextStyle, { opacity: 0.5 }]}>
                      {strings.NO_RESULT_FOUND}
                    </Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }
}
function mapStateToProps(state) {
  //console.log(state);
  return { apiname: state.app.apiname, loadingState: state.app.loading };
}

export default ContactViewPopUp;
