/**
 * Size charts, in inches. Measured flat: chest width is pit to pit,
 * body length is high shoulder point to hem.
 * Placeholder specs — replace with your factory's final measurements.
 */
export type SizeRow = { size: string; chest: number; length: number };
export type SizeChart = { Youth: SizeRow[]; Adult: SizeRow[] };

export const sizeCharts: Record<"tee" | "hoodie", SizeChart> = {
  tee: {
    Youth: [
      { size: "S", chest: 17, length: 21 },
      { size: "M", chest: 18.5, length: 23 },
      { size: "L", chest: 20, length: 25 },
      { size: "XL", chest: 21.5, length: 26.5 },
    ],
    Adult: [
      { size: "XS", chest: 21, length: 26.5 },
      { size: "S", chest: 22, length: 27.5 },
      { size: "M", chest: 23.5, length: 28.5 },
      { size: "L", chest: 25, length: 29.5 },
      { size: "XL", chest: 26.5, length: 30.5 },
      { size: "XXL", chest: 28, length: 31.5 },
    ],
  },
  hoodie: {
    Youth: [
      { size: "S", chest: 18, length: 21 },
      { size: "M", chest: 19.5, length: 23 },
      { size: "L", chest: 21, length: 25 },
      { size: "XL", chest: 22.5, length: 26.5 },
    ],
    Adult: [
      { size: "XS", chest: 22.5, length: 26 },
      { size: "S", chest: 23.5, length: 27 },
      { size: "M", chest: 25, length: 28 },
      { size: "L", chest: 26.5, length: 29 },
      { size: "XL", chest: 28, length: 30 },
      { size: "XXL", chest: 29.5, length: 31 },
    ],
  },
};
