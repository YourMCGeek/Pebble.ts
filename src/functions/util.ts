/**
 * Converts a given number of bytes into a more readable format with appropriate units.
 * The function returns an object containing the converted value, the unit, and a string representation.
 *
 * @param bytes - The number of bytes to convert.
 * @param comma - The number of decimal places to include in the converted value. Default is 3.
 * @returns An object containing:
 *   - `value`: The converted value.
 *   - `unit`: The unit of the converted value (Bytes, KiB, MiB, GiB).
 *   - `string`: A string representation of the converted value and unit.
 *
 * @author BothimTV <https://github.com/BothimTV/pterodactyl.ts/blob/main/src/functions/util.ts>
 */
export function smartConvert(
  bytes: number,
  comma: number = 3,
): {
  value: number;
  unit: string;
  string: string;
} {
  if (bytesToGigabytes(bytes, 0) == 0) {
    // > 1GB
    if (bytesToMegabytes(bytes, 0) == 0) {
      // > 1MB
      if (bytesToKilobytes(bytes, 0) == 0) {
        // > 1KB
        return { value: bytes, unit: 'Bytes', string: `${bytes} Bytes` };
      }
      return {
        value: bytesToKilobytes(bytes, comma),
        unit: 'KiB',
        string: `${bytesToKilobytes(bytes, comma)} KiB`,
      };
    }
    return {
      value: bytesToMegabytes(bytes, comma),
      unit: 'MiB',
      string: `${bytesToMegabytes(bytes, comma)} MiB`,
    };
  }
  return {
    value: bytesToGigabytes(bytes, comma),
    unit: 'GiB',
    string: `${bytesToGigabytes(bytes, comma)} GiB`,
  };
}

/**
 * Converts a given number of bytes to gigabytes.
 *
 * @param bytes - The number of bytes to convert.
 * @param comma - The number of decimal places to include in the result. Defaults to 3.
 * @returns The equivalent number of gigabytes.
 *
 * @author BothimTV <https://github.com/BothimTV/pterodactyl.ts/blob/main/src/functions/util.ts>
 */
function bytesToGigabytes(bytes: number, comma: number = 3): number {
  return parseFloat((bytes / 1073741824).toFixed(comma));
}

/**
 * Converts a given number of bytes into megabytes.
 *
 * @param bytes - The number of bytes to convert.
 * @param comma - The number of decimal places to include in the result. Defaults to 3.
 * @returns The equivalent number of megabytes.
 *
 * @author BothimTV <https://github.com/BothimTV/pterodactyl.ts/blob/main/src/functions/util.ts>
 */
function bytesToMegabytes(bytes: number, comma: number = 3): number {
  return parseFloat((bytes / 1048576).toFixed(comma));
}

/**
 * Converts a given number of bytes to kilobytes.
 *
 * @param bytes - The number of bytes to convert.
 * @param comma - The number of decimal places to include in the result. Defaults to 3.
 * @returns The equivalent number of kilobytes, rounded to the specified number of decimal places.
 *
 * @author BothimTV <https://github.com/BothimTV/pterodactyl.ts/blob/main/src/functions/util.ts>
 */
function bytesToKilobytes(bytes: number, comma: number = 3): number {
  return parseFloat((bytes / 1024).toFixed(comma));
}
