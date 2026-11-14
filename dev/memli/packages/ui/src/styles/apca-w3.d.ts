// apca-w3 ships plain JavaScript. These are the two functions the color check uses.
declare module "apca-w3" {
  /** APCA lightness contrast (Lc). Positive for dark text on light, negative for light on dark. */
  export function APCAcontrast(
    textY: number,
    backgroundY: number,
    places?: number
  ): number | string

  /** Screen luminance (Y) of an 8-bit sRGB color given as [r, g, b]. */
  export function sRGBtoY(rgb: readonly number[]): number
}
