/** A 5 × 2 ten-frame outline. The dots are drawn on top by the scene. */
export function TenFrame({ x, y, cell, caption }: { x: number; y: number; cell: number; caption?: string }) {
  const lines = [];
  for (let c = 1; c < 5; c++) lines.push(<line key={`c${c}`} x1={x + c * cell} y1={y} x2={x + c * cell} y2={y + 2 * cell} />);
  lines.push(<line key="r" x1={x} y1={y + cell} x2={x + 5 * cell} y2={y + cell} />);
  return (
    <g className="tenframe" aria-hidden="true">
      <rect x={x} y={y} width={5 * cell} height={2 * cell} rx={6} />
      {lines}
      {caption && (
        <text x={x + 5 * cell + 4} y={y + 2 * cell - 4} className="frame-caption" textAnchor="start">
          {caption}
        </text>
      )}
    </g>
  );
}
