import React, { Component } from 'react';
import { View, StyleSheet, Modal, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Swiper from 'react-native-swiper';
import { createImageProgress } from 'react-native-image-progress';
import * as Animatable from 'react-native-animatable';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { actions as homeActions } from '../../ducks/home';
import { getUserObject } from '../../helpers/UserHelper';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import { CROSS_WHITE_IMAGE } from '../../assets/images';
import { IF_OS_IS_IOS, SCREEN_WIDTH, SCREEN_HEIGHT, GET_HEADER_HEIGHT, GET_HEADER_PADDINGTOP } from '../../config/common_styles';

const NAVBAR_HEIGHT = GET_HEADER_HEIGHT();
const NAVBAR_TOP_PADDING = GET_HEADER_PADDINGTOP();
const AnimatedImage = createImageProgress(Animatable.Image);

class Slider extends Component {

  constructor(props) {
    super(props);
    const { introSlides, seenSlider } = this.props;
    this.state = {
      showSlider: !seenSlider,
      showClose: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const { introSlides, seenSlider } = nextProps;
    if (introSlides && introSlides.length > 0 && introSlides.length === 1) {
      this.setState({
        showClose: true
      });
    }
  }

  handleRequestClose = () => {
  }

  handleSlidesClose = () => {
    this.props.setSeenSlides(true);
    this.setState({
      showSlider: false
    });
  }

  handleSlideChange = (index) => {
    console.log('slider index', index);
    const { introSlides } = this.props;
    const isLastSlide = index == introSlides.length - 1;
    if (isLastSlide) {
      this.setState({
        showClose: true
      });
    }
  }

  handleRenderSlider = (slide, i) => {
    const { Id, Url } = slide;
    return (
      <View style={styles.sliderContainer} key={Id}>
        <AnimatedImage
          animation={'fadeIn'}
          duration={1e3}
          easing="ease-out-expo"
          style={styles.sliderImage}
          source={{ uri: Url }}
          resizeMode={'contain'} />
      </View>
    );
  }

  renderCloseButton() {
    const { showClose } = this.state;
    return showClose && (
      <Animatable.View
        animation={'slideInRight'}
        duration={400}
        easing={'ease-out-back'}
        style={styles.closeContainer}>
        <TouchableOpacity onPress={this.handleSlidesClose} style={styles.closeButton}>
          <Image style={styles.closeImage} source={CROSS_WHITE_IMAGE} />
        </TouchableOpacity>
      </Animatable.View>
    );
  }

  render() {
    const { showSlider } = this.state;
    const { introSlides } = this.props;
    const hasSlides = introSlides.length > 0;
    const { theme: { thirdColor } } = this.props;

    return hasSlides && (
      <Modal
        transparent
        visible={showSlider}
        onRequestClose={this.handleRequestClose}>
        <View style={styles.modalBackground}>
          {this.renderCloseButton()}
          <Swiper
            loop={false}
            dotColor={`${thirdColor}50`}
            activeDotColor={thirdColor}
            showButtons={false}
            paginationStyle={styles.pagination}
            // style={styles.swiper}
            onIndexChanged={this.handleSlideChange}>
            {introSlides.map(this.handleRenderSlider)}
          </Swiper>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    // position: 'absolute',
    // left: 0,
    // top: 0,
    // right: 0,
    // bottom: 0,
    // zIndex: -1
  },
  swiper: {
    flex: 1,
    position: 'absolute',
    zIndex: 8,
    width: IF_OS_IS_IOS ? null : SCREEN_WIDTH,
    height: IF_OS_IS_IOS ? null : SCREEN_HEIGHT
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sliderImage: {
    flex: 1,
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.9
  },
  closeContainer: {
    position: 'absolute',
    right: 10,
    top: ifIphoneX(105, 20),
    zIndex: 8
  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 18,
    height: 18,
    padding: 40,
    paddingTop: 30,
    paddingRight: 30
  },
  closeImage: {
    width: 18,
    height: 18,
    resizeMode: 'contain'
  },
  pagination: {
    bottom: ifIphoneX(95, 10),
    zIndex: IF_OS_IS_IOS ? null : 8
  }
});

function mapStateToProps(state) {
  const { home: { seenSlider, introSlides } } = state;
  const { LevelName } = getUserObject(state);
  const theme = getThemeByLevel(LevelName);
  return { introSlides, seenSlider, theme };
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
    ...homeActions
  }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Slider);
