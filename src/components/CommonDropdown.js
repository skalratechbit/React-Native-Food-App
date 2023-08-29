import React, { Component } from 'react';
import ModalDropdown from 'react-native-modal-dropdown';
import { View } from 'react-native';

class CommonDropdown extends Component {
  renderSeparator = (sectionID, rowID, adjacentRowHighlighted) => {
    let key = `spr_${rowID}`;
    return <View style={styles.separator} key={key} />;
  };
  render() {
    return (
      <View>
        <ModalDropdown
          style={this.props.dropDownStyle ? this.props.dropDownStyle : styles.dropDownStyle}
          textStyle={
            this.props.dropDownTextStyle ? this.props.dropDownTextStyle : styles.dropDownTextStyle
          }
          dropdownTextStyle={styles.dropDownCellStyle}
          dropdownStyle={this.props.dropMenuStyle ? this.props.dropMenuStyle : styles.dropMenuStyle}
          defaultIndex={-1}
          defaultValue={this.props.defaultValue}
          transparent={false}
          options={this.props.items}
          onSelect={this.props.onSelect}
          renderSeparator={this.renderSeparator}
        />
      </View>
    );
  }
}

export { CommonDropdown };

const styles = {
  dropMenuStyle: {
    flex: 1,
    left: 0,
    right: 10,
    marginTop: 5,
    borderRadius: 10,
    borderWidth: 1,
    paddingBottom: 5,
    paddingLeft: 0,
    paddingRight: 0,
    borderColor: 'white'
  },
  dropDownStyle: {
    height: 30,
    borderWidth: 0
  },
  dropDownTextStyle: {
    fontSize: 16,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    borderWidth: 0
  },
  dropDownCellStyle: {
    fontSize: 16,
    borderWidth: 0
  },
  separator: {
    height: 0,
    backgroundColor: 'lightgray'
  }
};
