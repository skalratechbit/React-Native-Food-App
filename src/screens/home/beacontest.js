
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  DeviceEventEmitter,
} from 'react-native';
import { connect } from 'react-redux';
import Beacons from '@nois/react-native-beacons-manager';
/**
 * uuid of YOUR BEACON (change to yours)
 * @type {String} uuid
 */
const UUIDS = [
  '7b44b47b-52a1-5381-90c2-f09b6838c5d1',
  '7b44b47b-52a1-5381-90c2-f09b6838c5d2',
  '7b44b47b-52a1-5381-90c2-f09b6838c5d3',
  '7b44b47b-52a1-5381-90c2-f09b6838c5d4',
  '7b44b47b-52a1-5381-90c2-f09b6838c5d5',
  '7b44b47b-52a1-5381-90c2-f09b6838c5d6',
  '7b44b47b-52a1-5381-90c2-f09b6838c5d7',
  '7b44b47b-52a1-5381-90c2-f09b6838c5d8',
  '7b44b47b-52a1-5381-90c2-f09b6838c5d9',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b43a',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b43b',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b43c',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b43d',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b43e',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b43f',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b421',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b422',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b423',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b424',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b425',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b426',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b427',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b428',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b429',
  '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b420',
  '1c3744e1-fc8e-4129-9f29-0a3478981665',
  'c9790226-ba1a-4ca1-befb-eb3e7f5fb5e4',
];

class beacontest extends Component {
  // will be set as a reference to "beaconsDidRange" event:
  beaconsDidRangeEvent = null;

  constructor(props) {
    super(props);

    let regions = [];
    let rangedBeaconsUUIDMap = {};
    UUIDS.forEach((uuid, index) => {
      regions.push({ identifier: index.toString() , uuid });
      rangedBeaconsUUIDMap[uuid.toUpperCase()] = [];
    });

    this.state = {
      // region information
      regions,

      // list of desired UUID to range (Note: these will be section headers in the listview rendered):
      rangedBeaconsUUIDMap,

      // React Native ListViews datasources initialization
      rangingDataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
      }).cloneWithRows([]),

      // check bluetooth state:
      bluetoothState: '',
    };
  }

  async componentWillMount() {
    const { regions } = this.state;

    Beacons.requestAlwaysAuthorization();

    // Range for beacons inside the region

    try {
      regions.forEach(async region => {
        await Beacons.startRangingBeaconsInRegion(region);
      });
    } catch (error) {
      //console.log(error);
    }

    // update location to ba able to monitor:
    Beacons.startUpdatingLocation();
  }

  componentDidMount() {
    //
    // component state aware here - attach events
    //

    // Ranging: Listen for beacon changes
    this.beaconsDidRangeEvent = DeviceEventEmitter.addListener(
      'beaconsDidRange',
      data => {
        //console.log('beaconsDidRange data: ', data);
        const { beacons } = data;
        const { rangingDataSource } = this.state;
        this.setState({
          rangingDataSource: rangingDataSource.cloneWithRowsAndSections(
            this.convertRangingArrayToMap(beacons),
          ),
        });
      },
    );

    // listen bluetooth state change event
    // BluetoothState.subscribe(bluetoothState =>
    //   this.setState({ bluetoothState: bluetoothState }),
    // );
    //
    // BluetoothState.initialize();
  }

  async componentWillUnMount() {
    const { regions } = this.state;

    try {
      regions.forEach(async region => {
        await Beacons.stopRangingBeaconsInRegion(region);
      });
    } catch (error) {
      //console.log(error);
    }

    // remove ranging event we registered at componentDidMount
    this.beaconsDidRangeEvent.remove();
  }

  render() {
    const { bluetoothState, rangingDataSource } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.btleConnectionStatus}>
          Bluetooth connection status: {bluetoothState ? bluetoothState : 'NA'}
        </Text>
        <Text style={styles.headline}>ranging beacons:</Text>
        <ListView
          dataSource={rangingDataSource}
          enableEmptySections={true}
          renderRow={this.renderRangingRow}
          renderSectionHeader={this.renderRangingSectionHeader}
        />
      </View>
    );
  }

  renderRangingSectionHeader = (sectionData, uuid) => (
    <Text style={styles.rowSection}>{uuid}</Text>
  );

  renderRangingRow = rowData => (
    <View style={styles.row}>
      <Text style={styles.smallText}>
        UUID: {rowData.uuid ? rowData.uuid : 'NA'}
      </Text>
      <Text style={styles.smallText}>
        Major: {rowData.major ? rowData.major : 'NA'}
      </Text>
      <Text style={styles.smallText}>
        Minor: {rowData.minor ? rowData.minor : 'NA'}
      </Text>
      <Text>RSSI: {rowData.rssi ? rowData.rssi : 'NA'}</Text>
      <Text>Proximity: {rowData.proximity ? rowData.proximity : 'NA'}</Text>
      <Text>
        Distance: {rowData.accuracy ? rowData.accuracy.toFixed(2) : 'NA'}m
      </Text>
    </View>
  );

  convertRangingArrayToMap = rangedBeacon => {
    const { rangedBeaconsUUIDMap } = this.state;

    rangedBeacon.forEach(beacon => {
      if (beacon.uuid.length > 0) {
        const uuid = beacon.uuid.toUpperCase();
        const rangedBeacons = rangedBeaconsUUIDMap[uuid].filter(
          rangedBeac => rangedBeac === uuid,
        );

        rangedBeaconsUUIDMap[uuid] = [...rangedBeacons, beacon];
      }
    }
  );
    this.setState({ rangedBeaconsUUIDMap });
    return rangedBeaconsUUIDMap;
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    margin: 5,
    backgroundColor: '#F5FCFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btleConnectionStatus: {
    fontSize: 20,
    paddingTop: 20,
  },
  headline: {
    fontSize: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  row: {
    padding: 8,
    paddingBottom: 16,
  },
  smallText: {
    fontSize: 11,
  },
  rowSection: {
    fontWeight: '700',
  },
});

export default  connect ( null, null ) (beacontest);
