const splitList = (whitelist?: string) => (whitelist || "").split(",").map((origin) => origin.trim());

export const whitelist = splitList(process.env.WHITELIST);
export const cors = whitelist.length > 0 ? whitelist : true;
export const refererList = splitList(process.env.REFERER);
