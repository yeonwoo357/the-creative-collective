import type { SVGProps } from "react";

type PixelIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  active?: boolean;
};

// Each coordinate is a whole pixel on a 16×16 grid. Only square, filled
// pixel cells form the outlines; there are no smooth strokes or curves.
type Point = readonly [number, number];
function outline(...lines: readonly Point[][]): string {
  const pixels = new Set<string>();
  for (const line of lines) {
    for (let i = 1; i < line.length; i++) {
      const from = line[i - 1];
      const to = line[i];
      if (!from || !to) continue;
      let [x, y] = from;
      const [endX, endY] = to;
      const dx = Math.abs(endX - x), dy = -Math.abs(endY - y);
      const sx = x < endX ? 1 : -1, sy = y < endY ? 1 : -1;
      let error = dx + dy;
      while (true) {
        pixels.add(`${x},${y}`);
        if (x === endX && y === endY) break;
        const twice = 2 * error;
        if (twice >= dy) { error += dy; x += sx; }
        if (twice <= dx) { error += dx; y += sy; }
      }
    }
  }
  return [...pixels].map((pixel) => {
    const [x, y] = pixel.split(",");
    return `M${x} ${y}h1v1h-1z`;
  }).join("");
}

function icon(name: string, path: string) {
  function PixelIcon({ size = 24, active = false, fill, strokeWidth: _strokeWidth,
    children, ...props }: PixelIconProps) {
    const inverted = active || (!!fill && fill !== "none");
    const labelled = !!props["aria-label"] || !!props["aria-labelledby"];
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
        shapeRendering="crispEdges" aria-hidden={labelled ? undefined : true}
        role={labelled ? "img" : undefined} focusable="false" data-pixel-icon={name}
        data-active={inverted ? "true" : "false"} {...props}>
        {inverted && <rect width="16" height="16" fill="currentColor" />}
        <path d={path} fill={inverted ? "var(--background)" : "currentColor"} />
        {children}
      </svg>
    );
  }
  PixelIcon.displayName = `Pixel${name}`;
  return PixelIcon;
}

export const Search = icon("search", outline(
  [[5,1],[8,1],[10,3],[10,8],[8,10],[3,10],[1,8],[1,4],[4,1],[5,1]],
  [[9,9],[14,14]], [[10,9],[14,13]],
));
export const User = icon("person", outline(
  [[6,1],[9,1],[11,3],[11,6],[9,8],[6,8],[4,6],[4,3],[6,1]],
  [[5,9],[10,9],[13,12],[13,13],[10,15],[5,15],[2,13],[2,12],[5,9]],
));
export const Bookmark = icon("star", outline(
  [[7,1],[8,1],[10,6],[14,6],[11,9],[12,14],[8,11],[3,14],[4,9],[1,6],[5,6],[7,1]],
));
export const Globe2 = icon("globe", outline(
  [[5,1],[10,1],[13,4],[14,6],[14,9],[13,11],[10,14],[5,14],[2,11],[1,9],[1,6],[2,4],[5,1]],
  [[7,1],[5,4],[4,7],[5,11],[7,14]], [[8,1],[10,4],[11,7],[10,11],[8,14]],
  [[2,5],[13,5]], [[1,9],[14,9]],
));
export const Globe = Globe2;
export const MessageCircle = icon("chat", outline(
  [[3,2],[12,2],[14,4],[14,10],[12,12],[7,12],[3,15],[3,12],[1,10],[1,4],[3,2]],
  [[4,6],[11,6]], [[4,9],[9,9]],
));
export const Settings = icon("gear", outline(
  [[6,1],[9,1],[9,3],[11,4],[13,3],[14,5],[12,7],[12,9],[14,10],[13,13],[11,12],[9,13],[9,15],[6,15],[6,13],[4,12],[2,13],[1,10],[3,9],[3,7],[1,5],[2,3],[4,4],[6,3],[6,1]],
  [[6,6],[9,6],[10,7],[10,9],[9,10],[6,10],[5,9],[5,7],[6,6]],
));
export const X = icon("close", outline([[3,3],[12,12]], [[12,3],[3,12]]));
export const Plus = icon("plus", outline([[3,7],[12,7]], [[7,3],[7,12]]));
export const Minus = icon("minus", outline([[3,7],[12,7]]));
export const LocateFixed = icon("recentre", outline(
  [[5,3],[10,3],[12,5],[12,10],[10,12],[5,12],[3,10],[3,5],[5,3]],
  [[7,0],[7,5]], [[7,10],[7,15]], [[0,7],[5,7]], [[10,7],[15,7]],
));
export const MapPin = icon("location", outline(
  [[5,1],[10,1],[12,3],[12,7],[8,14],[7,14],[3,7],[3,3],[5,1]],
  [[6,4],[9,4],[9,7],[6,7],[6,4]],
));
export const ChevronLeft = icon("back", outline([[10,2],[4,8],[10,14]]));
export const ChevronRight = icon("forward", outline([[5,2],[11,8],[5,14]]));
export const MoreHorizontal = icon("more", "M2 7h2v2H2zM7 7h2v2H7zM12 7h2v2h-2z");
export const Send = icon("send", outline(
  [[1,2],[14,7],[14,8],[1,13],[4,8],[9,8]], [[1,2],[4,7],[9,7]],
));
export const Copy = icon("copy", outline(
  [[5,5],[13,5],[13,14],[5,14],[5,5]], [[10,3],[10,1],[1,1],[1,10],[3,10]],
));
export const Instagram = icon("instagram", outline(
  [[3,1],[12,1],[14,3],[14,12],[12,14],[3,14],[1,12],[1,3],[3,1]],
  [[6,4],[9,4],[11,6],[11,9],[9,11],[6,11],[4,9],[4,6],[6,4]], [[11,3],[12,3]],
));
export const Music2 = icon("music", outline(
  [[7,11],[7,2],[13,1],[13,10]], [[7,5],[13,4]],
  [[3,10],[6,10],[7,11],[7,13],[6,14],[3,14],[2,13],[2,11],[3,10]],
  [[10,9],[12,9],[13,10],[13,12],[12,13],[10,13],[9,12],[9,10],[10,9]],
));
export const Pencil = icon("edit", outline(
  [[2,10],[10,2],[12,2],[14,4],[14,6],[6,14],[1,14],[2,10]], [[9,3],[13,7]], [[2,10],[6,14]],
));
export const ImagePlus = icon("add-media", outline(
  [[8,2],[1,2],[1,14],[14,14],[14,8]], [[2,11],[5,8],[8,11],[10,9],[13,12]],
  [[10,3],[15,3]], [[12,1],[12,6]], [[4,5],[5,5]],
));
export const Check = icon("check", outline([[2,8],[6,12],[13,4]]));
export const Circle = icon("circle", outline([[5,2],[10,2],[13,5],[13,10],[10,13],[5,13],[2,10],[2,5],[5,2]]));