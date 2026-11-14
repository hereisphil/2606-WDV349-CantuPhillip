## 1. CTA options: label legibility and how far the button stands out

| Theme | Option | Fill | Label | Label WCAG | Label Lc | Fill vs card | Fill vs page | Fill vs hero used with it |
|---|---|---|---|--:|--:|--:|--:|--:|
| light | Current (blue, 126px wide) | #1447e6 | #ffffff | 6.83 | -87.5 | 6.83 | 6.55 | 6.30 (current pale tint #f1f6ff) |
| light | A: blue.700 + white | #1447e6 | #ffffff | 6.83 | -87.5 | 6.83 | 6.16 | 5.74 (soft hero blue.100 #e1ecff) |
| light | A3: white + blue.800 label on bold hero | #ffffff | #153bb7 | 8.97 | 89.6 | 1.00 | 1.11 | 14.39 (bold hero blue.950 #14255f) |
| light | B: amber.400 + ink | #fec71d | #0d1529 | 11.59 | 76.9 | 1.57 | 1.41 | 9.18 (bold hero blue.950 #14255f) |
| light | C: orange.600 + white (example-04 style) | #d75b01 | #ffffff | 3.90 | -71.1 | 3.90 | 3.51 | 3.28 (soft hero blue.100 #e1ecff) |
| light | C2: orange.500 + ink | #f37513 | #0d1529 | 6.37 | 48.9 | 2.85 | 2.57 | 5.05 (bold hero blue.950 #14255f) |
| dark | Current (sky blue + near-black label) | #6a99ff | #0a111b | 6.87 | 50.3 | 6.05 | 6.87 | 5.09 (current panel #252c38) |
| dark | A1: blue.700 + near-white (saturated) | #1447e6 | #f9fafd | 6.55 | -84.2 | 2.34 | 2.68 | 2.03 (soft hero navy.800 #202c47) |
| dark | A2: blue.200 + ink (pale, the verified A) | #c8dcff | #060c1d | 14.04 | 84.4 | 11.53 | 13.21 | 10.01 (soft hero navy.800 #202c47) |
| dark | A3: blue.100 + blue.950 label on bold hero | #e1ecff | #14255f | 12.09 | 89.1 | 13.44 | 15.39 | 9.72 (bold hero blue.900 #1d3478) |
| dark | B: amber.300 + ink | #fed756 | #060c1d | 13.98 | 84.3 | 11.48 | 13.15 | 8.30 (bold hero blue.900 #1d3478) |
| dark | C: orange.600 + white | #d75b01 | #ffffff | 3.90 | -71.1 | 4.10 | 4.70 | 3.56 (soft hero navy.800 #202c47) |
| dark | C2: orange.400 + ink | #ff9b4e | #060c1d | 9.32 | 63.0 | 7.66 | 8.77 | 5.54 (bold hero blue.900 #1d3478) |

## 2. Color-vision simulation (culori filterDeficiency*, severity 1 = full dichromacy)

WCAG ratio and OKLab distance (dE) between each pair, for normal vision and three simulated deficiencies.

| Pair | Theme | Normal ratio / dE | Protan | Deutan | Tritan |
|---|---|--:|--:|--:|--:|
| B: CTA fill vs bold hero | light | 9.18 / 0.628 | 7.88 / 0.585 | 10.00 / 0.653 | 9.03 / 0.618 |
| A: CTA fill vs card | light | 6.83 / 0.567 | 6.05 / 0.542 | 7.35 / 0.582 | 7.00 / 0.551 |
| Success text vs danger text | light | 1.17 / 0.283 | 2.47 / 0.220 | 1.24 / 0.083 | 1.08 / 0.332 |
| Success text vs warning text | light | 1.02 / 0.209 | 1.34 / 0.088 | 1.31 / 0.121 | 1.05 / 0.282 |
| Warning text vs danger text | light | 1.14 / 0.086 | 1.84 / 0.165 | 1.62 / 0.120 | 1.03 / 0.051 |
| Streak orange vs CTA amber | light | 2.49 / 0.265 | 3.34 / 0.319 | 2.74 / 0.282 | 2.05 / 0.205 |
| Viz mastered vs learning | light | 3.68 / 0.330 | 3.88 / 0.342 | 3.45 / 0.321 | 3.83 / 0.326 |
| Viz learning vs not started | light | 3.28 / 0.375 | 2.99 / 0.352 | 3.56 / 0.393 | 3.13 / 0.347 |
| Link vs body text | light | 1.79 / 0.253 | 1.97 / 0.265 | 1.69 / 0.247 | 1.73 / 0.142 |
| B: CTA fill vs bold hero | dark | 8.30 / 0.603 | 7.25 / 0.567 | 9.02 / 0.625 | 8.06 / 0.578 |
| A: CTA fill vs card | dark | 11.53 / 0.639 | 11.62 / 0.642 | 11.48 / 0.639 | 11.54 / 0.639 |
| Success text vs danger text | dark | 1.24 / 0.210 | 1.47 / 0.120 | 1.10 / 0.030 | 1.21 / 0.244 |
| Success text vs warning text | dark | 1.10 / 0.169 | 1.26 / 0.078 | 1.05 / 0.069 | 1.09 / 0.228 |
| Warning text vs danger text | dark | 1.13 / 0.078 | 1.17 / 0.078 | 1.15 / 0.069 | 1.11 / 0.034 |
| Streak orange vs CTA amber | dark | 1.50 / 0.145 | 1.72 / 0.162 | 1.53 / 0.132 | 1.38 / 0.118 |
| Viz mastered vs learning | dark | 3.29 / 0.368 | 3.02 / 0.349 | 3.55 / 0.385 | 3.15 / 0.344 |
| Viz learning vs not started | dark | 3.55 / 0.342 | 3.81 / 0.358 | 3.31 / 0.332 | 3.68 / 0.316 |
| Link vs body text | dark | 1.16 / 0.064 | 1.14 / 0.057 | 1.18 / 0.067 | 1.15 / 0.059 |

Simulated colors (hex) of the three status text colors:
  light success      normal #037952 L=0.51 | protan #6f6850 L=0.52 | deutan #575655 L=0.45 | tritan #007c6d L=0.52
  light warning      normal #a94e00 L=0.53 | protan #6c5100 L=0.45 | deutan #816401 L=0.52 | tritan #ce3b37 L=0.57
  light destructive  normal #bc1a18 L=0.51 | protan #332c17 L=0.30 | deutan #564716 L=0.40 | tritan #e60d1a L=0.58
  dark success      normal #85e9b6 L=0.86 | protan #e4d8b4 L=0.88 | deutan #d0cbb9 L=0.84 | tritan #75e9d9 L=0.86
  dark warning      normal #ffbf87 L=0.85 | protan #d4c184 L=0.81 | deutan #e3ce88 L=0.85 | tritan #ffb2ae L=0.86
  dark destructive  normal #ffaaa8 L=0.82 | protan #b7b4a8 L=0.77 | deutan #cac2a7 L=0.81 | tritan #ffa3aa L=0.83

## 3. APCA font lookup: smallest font size (px) allowed at each measured Lc

fontLookupAPCA(Lc) from apca-w3 returns the minimum px size per weight. 999 = too low to use; 777 = non-text only.

| Text role | Theme | Surface | Lc | min px @400 | @500 | @600 | @700 |
|---|---|---|--:|--:|--:|--:|--:|
| CURRENT muted-foreground | light | card | 81.1 | 17.25 | 15.81 | 14.81 | 14 |
| CURRENT muted-foreground | light | Today panel | 75.5 | 18 | 16 | 15 | 14 |
| CURRENT muted-foreground | light | chip / trend tile | 73.8 | 18.5 | 16.5 | 15.5 | 14.5 |
| CURRENT muted-foreground | dark | card | -45.0 | 42 | 32 | 28 | 24 |
| CURRENT muted-foreground | dark | Today panel / chip | -42.7 | 50 | 39 | 35 | 28 |
| CURRENT CTA label | dark | sky blue fill | 50.3 | 32 | 28 | 24 | 21 |
| foreground | light | card | 97.9 | 15.5 | 15 | 14 | 13.5 |
| foreground | light | page | 90.8 | 16 | 15.5 | 14.5 | 14 |
| muted-foreground | light | card | 83.5 | 16.75 | 15.81 | 14.81 | 14 |
| muted-foreground | light | page | 76.4 | 18 | 16 | 15 | 14 |
| muted-foreground | light | chip | 71.5 | 19.5 | 17.5 | 16 | 14.5 |
| hero-muted-foreground | light | hero | -80.6 | 17.25 | 15.81 | 14.81 | 14 |
| link | light | card | 82.4 | 17.25 | 15.81 | 14.81 | 14 |
| success | light | card | 76.6 | 18 | 16 | 15 | 14 |
| warning | light | card | 77.1 | 18 | 16 | 15 | 14 |
| destructive | light | card | 79.7 | 17.5 | 16 | 15 | 14 |
| B CTA label | light | amber fill | 76.9 | 18 | 16 | 15 | 14 |
| A CTA label | light | blue fill | -87.5 | 16.5 | 15.625 | 14.625 | 14 |
| foreground | dark | card | -92.3 | 16 | 15.5 | 14.5 | 14 |
| foreground | dark | page | -93.8 | 16 | 15.5 | 14.5 | 14 |
| muted-foreground | dark | card | -77.9 | 18 | 16 | 15 | 14 |
| muted-foreground | dark | page | -79.4 | 17.5 | 16 | 15 | 14 |
| muted-foreground | dark | chip | -73.1 | 19 | 17 | 15.5 | 14.5 |
| hero-muted-foreground | dark | hero | -87.0 | 16.5 | 15.625 | 14.625 | 14 |
| link | dark | card | -82.2 | 17.25 | 15.81 | 14.81 | 14 |
| success | dark | card | -79.0 | 17.5 | 16 | 15 | 14 |
| warning | dark | card | -73.3 | 19 | 17 | 15.5 | 14.5 |
| destructive | dark | card | -66.5 | 21.25 | 19 | 17 | 15 |
| B CTA label | dark | amber fill | 84.3 | 16.75 | 15.81 | 14.81 | 14 |
| A CTA label | dark | blue fill | 84.4 | 16.75 | 15.81 | 14.81 | 14 |

## 4. Albers in numbers: one color, many faces

| Same color | Placed on | WCAG vs that surface | APCA Lc |
|---|---|--:|--:|
| brand blue #1447e6 (blue.700) | white card | 6.83 | 82.4 |
| brand blue #1447e6 (blue.700) | soft tint blue.100 | 5.74 | 70.6 |
| brand blue #1447e6 (blue.700) | dark card navy.850 | 2.34 | -17.1 |
| brand blue #1447e6 (blue.700) | bold hero blue.900 | 1.69 | -11.6 |
| amber.400 CTA fill | white card | 1.57 | 25.7 |
| amber.400 CTA fill | light page neutral.100 | 1.41 | 18.5 |
| amber.400 CTA fill | bold hero blue.950 | 9.18 | -73.3 |
| amber.400 CTA fill | dark page navy.900 | 11.69 | -76.6 |
| light muted text neutral.700 | white card | 6.82 | 83.5 |
| light muted text neutral.700 | page neutral.100 | 6.14 | 76.4 |
| light muted text neutral.700 | chip neutral.200 | 5.71 | 71.5 |
| light muted text neutral.700 | soft tint blue.100 | 5.73 | 71.8 |
| light muted text neutral.700 | success container green.100 | 6.07 | 75.6 |
| light muted text neutral.700 | warning container orange.100 | 5.97 | 74.5 |
| chip fill neutral.200 | white card | 1.19 | 9.5 |
| chip fill neutral.200 | page neutral.100 | 1.08 | 0.0 |
| chip fill neutral.200 | soft tint blue.100 | 1.00 | 0.0 |
| mid gray border neutral.600 | white card | 3.66 | 64.2 |
| mid gray border neutral.600 | dark card navy.850 | 4.37 | -35.1 |
| mid gray border neutral.600 | bold hero blue.950 | 3.93 | -33.4 |

## 5. Alpha tints inherit their surround (why "bg-success/10" is not one color)

| Tint | Over surface | Resulting hex | Text on it | WCAG | Lc |
|---|---|---|---|--:|--:|
| light success at 12% | card | #e1efea | success text | 4.59 | 65.2 |
| light success at 12% | background | #d4e5e5 | success text | 4.18 | 59.2 |
| light success at 12% | muted | #ccdee0 | success text | 3.91 | 55.2 |
| light destructive at 12% | card | #f7e3e3 | destructive text | 5.17 | 65.7 |
| light destructive at 12% | background | #ead9de | destructive text | 4.69 | 59.8 |
| light destructive at 12% | muted | #e2d2d9 | destructive text | 4.38 | 55.8 |
| dark success at 12% | card | #243948 | success text | 8.17 | -74.4 |
| dark success at 12% | background | #1a2d3a | success text | 9.68 | -77.3 |
| dark success at 12% | muted | #354c60 | success text | 6.09 | -68.3 |
| dark destructive at 12% | card | #323147 | destructive text | 6.94 | -63.0 |
| dark destructive at 12% | background | #282638 | destructive text | 8.12 | -65.5 |
| dark destructive at 12% | muted | #44455f | destructive text | 5.11 | -56.8 |

## 6. P3: do any proposed tokens need it? Would it help?

Primitives outside sRGB: 0 of 73
  amber.400 CTA: sRGB token oklch(0.855 0.17 88) (#fec71d). P3 candidate oklch(0.855 0.19 88): in sRGB false, in P3 true; sRGB fallback after chroma reduction oklch(0.853 0.174 87.3) #ffc500; luminance Y sRGB token 0.6055 vs P3 candidate 0.6039
  orange.500 streak: sRGB token oklch(0.7 0.18 50) (#f37513). P3 candidate oklch(0.70 0.21 50): in sRGB false, in P3 true; sRGB fallback after chroma reduction oklch(0.702 0.201 45.0) #ff6b00; luminance Y sRGB token 0.2998 vs P3 candidate 0.2968
  green.500: sRGB token oklch(0.7 0.15 160) (#23ba7d). P3 candidate oklch(0.70 0.19 160): in sRGB false, in P3 true; sRGB fallback after chroma reduction oklch(0.709 0.169 157.0) #00bf75; luminance Y sRGB token 0.3502 vs P3 candidate 0.3572
  blue.700 brand: sRGB token oklch(0.488 0.243 264.376) (#1447e6). P3 candidate oklch(0.488 0.27 264.376): in sRGB true, in P3 true; sRGB fallback after chroma reduction oklch(0.488 0.270 264.4) #0a3ef5; luminance Y sRGB token 0.0901 vs P3 candidate 0.0886

## 7. prefers-contrast: more overrides

| Override | Theme | WCAG | Lc |
|---|---|--:|--:|
| muted-foreground := foreground, on card | light | 12.25 | 97.9 |
| muted-foreground := foreground, on chip | light | 10.25 | 85.9 |
| border := border-strong, vs card | light | 3.66 | 64.2 |
| border-strong := foreground, vs card | light | 12.25 | 97.9 |
| ring := foreground-strong, vs card | light | 18.16 | 104.8 |
| muted-foreground := foreground, on card | dark | 13.39 | -92.3 |
| muted-foreground := foreground, on chip | dark | 9.90 | -87.5 |
| border := border-strong, vs card | dark | 4.37 | -35.1 |
| border-strong := foreground, vs card | dark | 13.39 | -92.3 |
| ring := foreground-strong, vs card | dark | 15.33 | -102.2 |

## 8. Surface lightness steps (OKLCH L) current vs proposed

| Theme | Step | Current L (delta) | Proposed L (delta) |
|---|---|---|---|
| light | page -> card | 0.985 -> 1 (0.015) | 0.965 -> 1 (0.035) |
| light | page -> hero panel | 0.985 -> 0.971 (0.014) | 0.965 -> 0.29 (0.675) |
| light | card -> chip | 1 -> 0.962 (0.038) | 1 -> 0.94 (0.060) |
| light | page -> sidebar | 0.985 -> 0.962 | 0.965 -> 0.985 (0.020) |
| dark | page -> card | 0.175 -> 0.236 (0.061) | 0.195 -> 0.25 (0.055) |
| dark | page -> hero panel | 0.175 -> 0.291 (0.116) | 0.195 -> 0.35 (0.155) |
| dark | card -> chip | 0.236 -> 0.291 (0.055) | 0.25 -> 0.34 (0.090) |
| dark | page -> sidebar | 0.175 -> 0.236 | 0.195 -> 0.16 (0.035) |

Hue distance CTA amber vs hero: light 179 deg; dark 174 deg
