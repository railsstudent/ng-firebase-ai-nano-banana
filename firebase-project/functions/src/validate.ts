import logger from "firebase-functions/logger";

/**
 *
 * @param {string} value a string value to validate
 * @param {string} fieldName the name of the field being validated
 * @return {string | undefined} the validated string value or undefined if validation fails
 */
export function validate(value: string | undefined, fieldName: string) {
  const err = `${fieldName} is missing.`;
  if (!value) {
    logger.error(err);
    throw new Error(err);
  }

  return value;
}
