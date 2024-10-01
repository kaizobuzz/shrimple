//@ts-check
import { Game } from "./game.js";
import { getCurrentDate } from "./localstorage.js";

/**@typedef {import('./../shared/shrimp_type.js').Shrimp} Shrimp*/


export async function getShrimps() {
    const response = await fetch("data/shrimps.json");
    const shrimps = (await response.json()).shrimps;
    console.log(shrimps);
    return shrimps;
}
/**@param {String} str*/
const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

/**@param {String} prefix*/
function hashCurrentDate(prefix){
    return cyrb53(prefix+String(getCurrentDate())); 
}

/**@param {String} mode
@returns {Shrimp}*/
export function getDailyShrimp(mode) {    
    return Game.shrimp_list[hashCurrentDate(mode)%Game.shrimp_list.length];
}
