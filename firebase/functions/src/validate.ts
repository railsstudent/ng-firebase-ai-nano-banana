import logger from "firebase-functions/logger";

/**
 *
 * @param {string} value a string value to validate
 * @param {string} fieldName the name of the field being validated
 * @param {string[]} missingKeys  keep the key names that are without value
 * @return {string | undefined} the validated string value or undefined if validation fails
 */
export function validate(value: string | undefined, fieldName: string, missingKeys: string[]) {
  const err = `${fieldName} is missing.`;
  if (!value) {
    logger.error(err);
    missingKeys.push(fieldName);
    return "";
  }

  return value;
}
