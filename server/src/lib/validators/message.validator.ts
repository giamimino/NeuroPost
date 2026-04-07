import { ERRORS } from "src/constants/errors";
import { isObject } from "src/utils/isObject";
import isWSSendType from "src/utils/isWSSendType";

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