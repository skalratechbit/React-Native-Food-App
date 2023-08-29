import AsyncStorage from '@react-native-community/async-storage'

export function getAppTheme() {
  const theme = AsyncStorage.getItem('theme').then(data => this.setState({ componentTheme: data }));
}
const validateAddress = text => {
  if (/[^a-zA-Z0-9\- \/]/.test(text)) {
    return false;
  }
  return true;
};
export const validate = (type, data, filedname) => {
  if (data && data.length > 0) {
    if (type == 'email') {
      let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return reg.test(data) === true ? null : 'Invalid ' + filedname;
    } else if (type == 'string') {
      if (validateAddress(data)) return null;
      else return 'Invalid ' + filedname;
    }
  } else {
    return 'Invalid ' + filedname;
  }
};
export function convertData(data) {
  let array;

  try {
    const object = JSON.stringify(data);
    const obj = JSON.parse(object);
    array = obj.data;
    // array = array.data;
  } catch (e) {
    array = '';
  }

  return array;
}

export function getDataFromJson(data) {
  var obj;
  var array;

  var object = JSON.stringify(data);

  try {
    obj = JSON.parse(object);
    array = obj.data.data;
    // array = array.data;
  } catch (e) {
    array = '';
  }

  return array;
}

export const numberWithCommas = (x, appCurrency, showCurrency) => {
  var number = parseInt(x, 10);
  var a = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (showCurrency == null || showCurrency) {
    return a + ' ' + appCurrency;
  } else {
    return a;
  }
};
export const convertMealeArrayToCartArray43333333dddd4 = array => {
  var itemsArray = [];
  //for (var i = 0; i < array.length; i++) {
  var obj;
  obj['Price'] = array[i].ItemPrice;
  obj['DetailsImg'] = array[i].DetailsImg;
  obj['ID'] = array[i].ItemId;
  obj['ItemName'] = array[i].ItemName;
  obj['LargeImg'] = array[i].LargeImg;
  obj['PLU'] = array[i].PLU;
  obj['ThumbnailImg'] = array[i].ThumbnailImg;
  obj['Price'] = array[i].ItemPrice;
  obj['quantity'] = 1;
  itemsArray.push(obj);
  //}
  return itemsArray;
};

export const convertMealeArrayToCartArray = (obj, array) => {
  //var parsedItemsArray=[];
  for (var j = 0; j < obj.items.length; j++) {
    for (var k = 0; k < obj.items[j].ItemsOptions.length; k++) {
      //for (var i = 0; i < obj[j].items.length; i++) {
      var itemObject = obj.items[j].ItemsOptions[k];
      ////console.log("itemObject :",itemObject);
      var object = {};
      object['Price'] = itemObject.ItemPrice;
      object['DetailsImg'] = itemObject.DetailsImg;
      object['ID'] = itemObject.ItemId;
      object['ItemName'] = itemObject.ItemName;
      object['LargeImg'] = itemObject.LargeImg;
      object['PLU'] = itemObject.PLU;
      object['ThumbnailImg'] = itemObject.ThumbnailImg;
      object['Price'] = itemObject.ItemPrice;
      object['quantity'] = 1;
      object['Details'] = itemObject.ItemDetails;
      var parsedModifiersArray = [];
      var items = [];
      var ModifiersObject = {};
      modArray = [];
      for (var i = 0; i < itemObject.modifiers.length; i++) {
        const objModifiers = itemObject.modifiers[i];
        for (var n = 0; n < objModifiers.length; n++) {
          //console.log("objModifiers",objModifiers);
          var itemModObject = {
            ID: objModifiers[n].ModifierCategoryId,
            ModifierName_en: objModifiers[n].ModifierName_en,
            Price: objModifiers[n].ModifierPrice,
            PLU: objModifiers[n].ModifierPlu,
            ModifierDetails_en: objModifiers[n].ModifierDetails_en,
            MaxQuantity: '0',
            Quantity: 0,
            Selected: 0
          };
          items.push(itemModObject);
          ModifiersObject['details'] = {
            CategoryName_en: objModifiers[n].ModifierCategoryName_en
              ? objModifiers[n].ModifierCategoryName_en
              : 'Not Provided'
          };
        }
      }

      ModifiersObject['items'] = items;
      modArray.push(ModifiersObject);
      object['Modifiers'] = items.length > 0 ? modArray : null;
      array.push(object);
    }
  }
  return array;
};
export const convertUsualMealeArrayToCartArray = (usulaMealaArray, cartArray) => {
  for (var k = 0; k < usulaMealaArray.length; k++) {
    var object = {};
    object['Price'] = usulaMealaArray[k].ItemPrice;
    object['DetailsImg'] = usulaMealaArray[k].DetailsImg;
    object['ID'] = usulaMealaArray[k].ItemId;
    object['ItemName'] = usulaMealaArray[k].ItemName;
    object['LargeImg'] = usulaMealaArray[k].LargeImg;
    object['ThumbnailImg'] = usulaMealaArray[k].ThumbnailImg;
    object['Price'] = usulaMealaArray[k].ItemPrice;
    object['quantity'] = 1;
    object['Details'] = usulaMealaArray[k].ItemDetails;
    object['PLU'] = usulaMealaArray[k].ItemPlu;
    cartArray.push(object);
  }
  return cartArray;
};

export const KEYBOARD_OFFSET = 150;
import ReactNative, { Keyboard, TextInput } from 'react-native';
//import {KEYBOARD_OFFSET} from '../styles/common_styles';

export const showKeyBoardEventHandler = ref => {
  let currentlyFocusedField = TextInput.State.currentlyFocusedField();
  let scrollResponder = ref.getScrollResponder();

  scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
    ReactNative.findNodeHandle(currentlyFocusedField),
    KEYBOARD_OFFSET,
    true
  );
};

export const hideKeyBoardEventHandler = ref => {
  ref.scrollTo({ y: 0 });
};
