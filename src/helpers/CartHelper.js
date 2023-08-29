import moment from "moment";
import strings from '../config/strings/strings.js';

export const getPromos = state => {
  const {
    squardcorner: {
      userDetails: { Promos = [] }
    }
  } = state;
  return Promos;
};

export const hasPromo = state => getPromos(state).length > 0;

export const getCartPromos = state => {
  const {
    cart: {
      cartPromos = []
    }
  } = state;
  return cartPromos;
};

export const hasCartPromos = state => getCartPromos(state).length > 0;

export const validatePromo = promo => {
  const blankObj = [{}];
  const todayDate = moment().format("YYYY-MM-DD");
  const {
    ScheduleDate = blankObj,
    ScheduleTime = blankObj,
    TotalUsed = 0,
    TotalUse = 1
  } = promo;
  if(ScheduleDate.length == 0) ScheduleDate.push({});
  if(ScheduleTime.length == 0) ScheduleTime.push({});
  const {
    0: { FromDate = todayDate, ToDate = todayDate }
  } = ScheduleDate;
  const {
    0: { FromTime = "00:00:00", ToTime = "23:59:59" }
  } = ScheduleTime;
  const fromDateTime = moment(`${FromDate} ${FromTime}`);
  const toDateTime = moment(`${ToDate} ${ToTime}`);
  const rightNow = moment();
  const isValidTime = rightNow >= fromDateTime && rightNow <= toDateTime;
  const isValidUsage = (TotalUse == 0) || TotalUsed < TotalUse;
  const isValid = isValidTime && isValidUsage;
  return { isValidTime, isValidUsage, isValid };
};

export const validatePromoCode = (code, promos) => {
  let foundPromo = false;
  // find matching code
  let data = promos.PromoItems.length>0?promos.PromoItems:promos.PromoCheck;

  data.map(promo => {
    // const { PromoCode = '' } = promo;
    // if (PromoCode.toLowerCase() === code.toLowerCase()) {
      foundPromo = Object.assign({}, { ...promo });
    // }
  });

  // found no matching promo
  if (!foundPromo) return;

  // validate promo code
  const { isValidTime, isValidUsage, isValid } = validatePromo(foundPromo);

  // return if Promo is valid
  if(promos.PromoItems.length>0 && isValid)
    return { valid: true, promo: foundPromo,Items:data };
  else return { valid: true, promo: foundPromo};

  //process error
  return { valid: false, reason: isValidTime ? strings.PROMO_USED : strings.PROMO_EXPIRED };
};
