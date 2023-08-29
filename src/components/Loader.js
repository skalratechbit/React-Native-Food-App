import React, { Component } from 'react';
import { View, Modal } from 'react-native';
import { APP_COLOR_BLACK } from '../config/colors';
import { connect } from 'react-redux';
import { Bubbles } from 'react-native-loader';
import { getUserObject } from '../helpers/UserHelper';
import { getThemeByLevel } from '../config/common_styles/appthemes';

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
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040'
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 65,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
  }
};

class ToggleLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisibilty: this.props.toggleLoader,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ modalVisibilty: nextProps.toggleLoader });
    // for experimentational purposes, dont load for 10 seconds
    if (nextProps.toggleLoader && !this.props.toggleLoader)
      this.setTimeout = setTimeout(() => {
        this.setState({ modalVisibilty: false });
      }, 1e4);
    else clearInterval(this.setTimeout);

    this.setState({ apiname: nextProps.apiname });
  }

  componentWillUnmount() {
    // clean ups
    clearInterval(this.setTimeout);
  }

  handleRequestClose() {}

  render() {
    const { theme, color } = this.props;
    const { thirdColor } = theme;
    return this.state.modalVisibilty ? (
      <Modal
        transparent={true}
        visible={this.state.modalVisibilty}
        onRequestClose={this.handleRequestClose}>
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <Bubbles size={6} color={color || thirdColor} />
          </View>
        </View>
      </Modal>
    ) : null;
  }
}

function mapStateToProps(state) {
  console.log(state);
  const { LevelName } = getUserObject(state);
  const theme = getThemeByLevel(LevelName);
  const { app: { apiname }  } = state
  return { theme, apiname, toggleLoader: state.app.toggleLoader };
}

export default connect(
  mapStateToProps,
  null
)(ToggleLoader);