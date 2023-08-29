export const parseMobileNumber = phoneNumber => {
  //trim
  const trimmedNumber = String(phoneNumber).trim();
  //remove artifacts
  const straightNumber = trimmedNumber.replace(/[^0-9]/g, '');
  //remove initial zeros
  const noFillerNumber = straightNumber.replace(/^0*/, '');
  //does the number have 961 at the beginning?
  const has961 = noFillerNumber.match(/^961/);
  //is the number greater than 6
  const is7Digits = noFillerNumber.length == 7;
  //add 961 at the beginning if there isnt one
  const fullNumber = (is7Digits && !has961 ? '961' : '') + noFillerNumber;

  return fullNumber;
};
