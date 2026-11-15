import { sizeCharts } from "@/data/sizeGuide";
import type { Garment } from "@/data/products";

export function SizeChartTable({ garment, compact = false }: { garment: Garment; compact?: boolean }) {
  const chart = sizeCharts[garment];
  return (
    <div className={`grid gap-6 ${compact ? "" : "md:grid-cols-2"}`}>
      {(["Youth", "Adult"] as const).map((group) => (
        <div key={group} className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="eyebrow mb-2 text-left text-red">{group}</caption>
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="py-2 pr-4 font-semibold">Size</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Chest width</th>
                <th scope="col" className="py-2 font-semibold">Body length</th>
              </tr>
            </thead>
            <tbody>
              {chart[group].map((r) => (
                <tr key={r.size} className="border-b border-ink/15">
                  <th scope="row" className="py-2 pr-4 font-semibold">{r.size}</th>
                  <td className="py-2 pr-4 tabular-nums">{r.chest}&Prime;</td>
                  <td className="py-2 tabular-nums">{r.length}&Prime;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
