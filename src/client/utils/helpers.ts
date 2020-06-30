import _ from 'lodash';
import { LabelValueObj } from '../components/common/SelectBoxes/SelectBox';

export const mergeArrayObjects = (arr1: any[] = [], arr2: any) => {
  const exists = arr1.find((a) => {
    return a.id === arr2.id;
  });
  if (exists) {
    return arr1.map((a1) => {
      const merge = arr2.id === a1.id;
      if (merge) {
        return Object.assign({}, a1, arr2);
      }
      return a1;
    });
  }
  return arr1.concat(arr2);
};

export const omitTypenameKey = (arr: any) => {
  return arr.map((a: any) => {
    return _.omit(a, '__typename');
  });
};

export const labelMaps: { [key: string]: string } = {
  Mobile: 'Mobile and Accessories',
};

export const getLabelValueFromEnum = (obj: any) => {
  let converted: LabelValueObj[] = [];
  for (let a in obj) {
    let labelValueObj = new LabelValueObj();
    labelValueObj.label = labelMaps[obj[a]];
    labelValueObj.value = a;
    converted.push(labelValueObj);
  }
  return converted;
};
