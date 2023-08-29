import { validatePromo } from './CartHelper';

export const findItemInMenuBy = (prop, value, menu = []) => {
  let foundItem = null;
  const menuLength = menu.length;
  for (let i = 0; i < menuLength; i++) {
    if (menu[i][prop] == value) {
      foundItem = Object.assign({}, menu[i]);
      i = menuLength;
    }
  }
  return foundItem;
};

export const normalizeModifiers = (firstModifiers, secondModifiers) => {
  const primaries = [];
  const secondaries = {};
  // index modifiers
  secondModifiers.map(mod => {
    const { details = {} } = mod || {}
    secondaries[details.ID] = mod;
  });
  firstModifiers.map((mod, key) => {
    let newItems = [];
    const { details, items } = mod || {}
    items.map((item, index) => {
      const { items = [] } = secondModifiers[details.ID] || {};
      const secondItem = items.filter(itemObj => itemObj.ID == item.ID);
      newItems[index] = Object.assign(items[index], secondItem.length ? secondItem[0] : {});
    });
    mod.items = newItems;
    primaries[key] = mod;
  });
  return primaries;
};

export const selectModifiers = (Modifiers, SelectedModifiers) => {
  // index modifiers
  SelectedModifiers.map(selectModifier => {
    const modifiersLength = Modifiers.length;
    for(let i = 0; i < modifiersLength; i++) {
      const { details: { CategoryId }, items } = Modifiers[i];
      const matchedCategory = CategoryId === selectModifier.CategoryID;
      if(matchedCategory) {
        for(let o = 0; o < items.length; o++) {
          const matchedItem = items[o].PLU === selectModifier.PLU;
          if(matchedItem) {
            items[o]['Selected'] = 1;
            items[o]['Quantity'] = selectModifier.Quantity;
            // kill loop
            // o = items.length + 1;
          }
        }
      }
      // kill loop
      // i = modifiersLength + 1;
    }
  });
  return Modifiers;
};

export const normalizePromoInfo = allMenu => {
  return allMenu && allMenu.map(menu => {
    const promo = {};
    if(menu.Promo && menu.Promo.length) {
      menu.Promo.map(promotion => {
        const {
          PromoCategory,
          DiscountedPrice,
          FeaturedStars,
          DiscountUrl
        } = promotion;

        if(validatePromo(promotion)) {
          switch(PromoCategory) {
            default:
              promo.DiscountUrl = DiscountUrl;
              promo.DiscountedPrice = DiscountedPrice;
            break;
            case 'stars':
              promo.FeaturedStars = FeaturedStars;
            break;
          }
        }
      })
    }
    return { ...menu, ...promo };
  });
}
