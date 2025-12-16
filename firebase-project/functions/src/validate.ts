import express from "express";
import logger from "firebase-functions/logger";

/**
 *
 * @param {string} value a string value to validate
 * @param {string} fieldName the name of the field being validated
 * @param {express.Response} response  express response object
 * @return {string | undefined} the validated string value or undefined if validation fails
 */
export function validate(value: string | undefined, fieldName: string, response?: express.Response) {
  const err = `${fieldName} is missing.`;
  if (!value) {
    logger.error(err);
    if (response) {
      response.status(500).send(err);
    } else {
      throw new Error(err);
    }
  }

  return value;
}
