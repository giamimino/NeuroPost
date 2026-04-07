import { ERRORS } from "../../constants/errors.js";
import { isObject } from "../../utils/isObject.js";
import isWSSendType from "../../utils/isWSSendType.js";

export function validateMessage(raw: any) {
  let data: any;

  try {
    data = JSON.parse(raw.toString());

    if (!data || !isWSSendType(data.type) || !isObject(data)) {
      return {
        error: ERRORS.VALIDATION_ERROR,
      };
    } 
  } catch {
    return {
      error: ERRORS.VALIDATION_ERROR,
    };
  }

  return data;
}