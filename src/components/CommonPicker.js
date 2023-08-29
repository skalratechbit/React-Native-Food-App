import React from 'react';
import { View, Modal, TouchableOpacity, Text } from 'react-native';
import { List, ListItem } from 'native-base';
import {
  APP_COLOR_WHITE,
  APP_COLOR_BLACK
} from '../config/colors';
import { FONT_SCALLING } from '../config/common_styles';

const MODEL_HEIGHT = 200;

const CommonPicker = list => {
  const {
    listItemContainer,
    listItemTitleTextStyle
  } = styles;
  state = { show: true };

  handleRequestClose = () => {
    this.setState({ show: !this.state.show });
  };

  handleItemPress = event => this.onPress(event, item.ID, 'Push to Categories', item.index);

  return (
    <Modal
      transparent={true}
      visible={this.state.show}
      onRequestClose={this.handleRequestClose}>
      <View style={styles.modalBackground}>
        <List
          bounces={false}
          horizontal={false}
          dataArray={list}
          style={{ flex: 1 }}
          renderRow={item => (
            <ListItem style={listItemContainer}>
              <TouchableOpacity onPress={this.handleItemPress} style={listItemContainer}>
                <Text allowFontScaling={FONT_SCALLING} style={listItemTitleTextStyle}>
                  {abc}
                </Text>
              </TouchableOpacity>
            </ListItem>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = {
  modalBackground: {
    height: MODEL_HEIGHT,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: APP_COLOR_BLACK
  },
  listItemContainer: {
    backgroundColor: 'green'
  },
  listItemTitleTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: 25
  }
};

export { CommonPicker };
