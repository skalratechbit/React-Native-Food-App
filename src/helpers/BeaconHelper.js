import { DeviceEventEmitter } from 'react-native'
import RNBluetoothInfo from 'react-native-bluetooth-info'
import Beacons from '@nois/react-native-beacons-manager'
import { IF_OS_IS_IOS } from '../config/common_styles'

let beaconsDidRangeEvent = null

export const checkBluetoothStatus = (isOn, isOff) => {
  RNBluetoothInfo.getCurrentState().then(resp => {
    let { connectionState } = resp.type
    connectionState === 'on' ? isOn() : isOff()
  })
}

export const detectBeaconProximity = (beacons, handleDetectSuccess, handleDetectStopped) => {
  onDetectBeaconForDevice(beacons, handleDetectSuccess, handleDetectStopped)
}

export const sortBeaconsFromBranches = (branches) => {
  const beacons = []
  for (let i = 0; i < branches.length; i++) {
    for (let j = 0; j < branches[i].Beacons.length; j++) {
      beacons.push(branches[i].Beacons[j]);
    }
  }
  return beacons
}

async function onDetectBeaconForDevice (array, detectCallback, stopCallback) {
  // get regions
  const regions = []
  array.forEach(async (object, i) => {
    var ID = array[i].UUID
    regions.push({
      identifier: i.toString(),
      uuid: array[i].UUID.toUpperCase()
    })
  })

  // stop beacons
  setTimeout(() => stopBeaconsDetection(regions, stopCallback), 5000)
  if (IF_OS_IS_IOS) Beacons.requestAlwaysAuthorization()
  try {
    regions.forEach(async regionobject => {
      await Beacons.startRangingBeaconsInRegion(regionobject)
    })
  } catch (error) {}

  // update location to be able to monitor:
  if (IF_OS_IS_IOS) Beacons.startUpdatingLocation()

  // set beacons range event
  beaconsDidRangeEvent = DeviceEventEmitter.addListener(
    'beaconsDidRange',
    data => {
      const { beacons } = data

      if (beacons.length > 0) {
        console.log('innser', beacons);
        const beaconFilter = array.filter(
          obj => obj.UUID.toUpperCase() == data.beacons[0].uuid.toUpperCase()
        )
        console.log('beaconFilter', beaconFilter);

        if (beaconFilter.length > 0) {
          try {
            regions.forEach(async regionobject => {
              await Beacons.stopRangingBeaconsInRegion(regionobject)
            })
          } catch (error) {
            // console.log(error);
          }
          removeBeaconRangeEvent()
          if (detectCallback) detectCallback(beaconFilter)
        }
      }
    }
  )
}

async function stopBeaconsDetection (regions, stopCallback) {
  try {
    regions.forEach(async regionobject => {
      await Beacons.stopRangingBeaconsInRegion(regionobject)
    })
  } catch (error) {}
  // This was only active on Android stopBeaconsDetection method
  removeBeaconRangeEvent()
  if (stopCallback) stopCallback()
}

function removeBeaconRangeEvent () {
  if (beaconsDidRangeEvent) beaconsDidRangeEvent.remove()
}
