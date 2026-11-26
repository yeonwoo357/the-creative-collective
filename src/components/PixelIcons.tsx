import type { SVGProps } from "react";

/**
 * App icons: 1-bit pixel art on a 16×16 grid (crisp square cells, no curves or anti-aliasing),
 * with a rose "misprint" shadow one cell down-right for a slightly funky, retro feel.
 * `active` (selected) turns the pixels pink; `fill` (or active star/heart) also fills the inside.
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string;
  active?: boolean;
};

type Point = readonly [number, number];
const G = 16;

/** Pixels along straight segments (Bresenham). */
function lines(...polylines: readonly Point[][]): Set<string> {
  const px = new Set<string>();
  for (const line of polylines) {
    for (let i = 1; i < line.length; i++) {
      let [x, y] = line[i - 1]!;
      const [ex, ey] = line[i]!;
      const dx = Math.abs(ex - x),
        dy = -Math.abs(ey - y);
      const sx = x < ex ? 1 : -1,
        sy = y < ey ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        px.add(`${x},${y}`);
        if (x === ex && y === ey) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
          err += dy;
          x += sx;
        }
        if (e2 <= dx) {
          err += dx;
          y += sy;
        }
      }
    }
  }
  return px;
}

/** A one-pixel ring (midpoint circle). */
function ring(cx: number, cy: number, r: number): Set<string> {
  const px = new Set<string>();
  let x = r,
    y = 0,
    err = 1 - r;
  while (x >= y) {
    for (const [a, b] of [
      [x, y],
      [y, x],
      [-y, x],
      [-x, y],
      [-x, -y],
      [-y, -x],
      [y, -x],
      [x, -y],
    ] as const)
      px.add(`${cx + a},${cy + b}`);
    y++;
    if (err < 0) err += 2 * y + 1;
    else {
      x--;
      err += 2 * (y - x) + 1;
    }
  }
  return px;
}

const join = (...sets: Set<string>[]) => new Set(sets.flatMap((s) => [...s]));
const cells = (...pts: Point[]) => new Set(pts.map(([x, y]) => `${x},${y}`));

/** Cells enclosed by the outline (flood-fill the outside, keep what it can't reach). */
function inside(outline: Set<string>): Set<string> {
  const out = new Set<string>();
  const stack: Point[] = [];
  for (let i = -1; i <= G; i++) stack.push([i, -1], [i, G], [-1, i], [G, i]);
  while (stack.length) {
    const [x, y] = stack.pop()!;
    const k = `${x},${y}`;
    if (x < -1 || y < -1 || x > G || y > G || out.has(k) || outline.has(k)) continue;
    out.add(k);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  const fill = new Set<string>();
  for (let x = 0; x < G; x++)
    for (let y = 0; y < G; y++)
      if (!out.has(`${x},${y}`) && !outline.has(`${x},${y}`)) fill.add(`${x},${y}`);
  return fill;
}

const toPath = (px: Set<string>) =>
  [...px]
    .map((p) => {
      const [x, y] = p.split(",");
      return `M${x} ${y}h1v1h-1z`;
    })
    .join("");

function icon(name: string, shape: Set<string>, fillWhenActive = false) {
  const d = toPath(shape);
  const dFill = toPath(inside(shape));
  function PixelIcon({
    size = 24,
    active = false,
    fill,
    strokeWidth: _sw,
    children,
    ...props
  }: IconProps) {
    const filled = (fillWhenActive && active) || (!!fill && fill !== "none");
    const ink = active ? "var(--pink, #f8bcff)" : "currentColor";
    const labelled = !!props["aria-label"] || !!props["aria-labelledby"];
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 17 17"
        fill="none"
        shapeRendering="crispEdges"
        aria-hidden={labelled ? undefined : true}
        role={labelled ? "img" : undefined}
        focusable="false"
        data-pixel-icon={name}
        data-active={active || filled ? "true" : "false"}
        {...props}
      >
        <g transform="translate(1 1)" fill="var(--rose, #ad5d84)" opacity={active ? 1 : 0.85}>
          <path d={d} />
          {filled && <path d={dFill} />}
        </g>
        <g fill={ink}>
          <path d={d} />
          {filled && <path d={dFill} />}
        </g>
        {children}
      </svg>
    );
  }
  PixelIcon.displayName = `Pixel${name}`;
  return PixelIcon;
}

export const Search = icon(
  "search",
  join(
    ring(6, 6, 4),
    lines([
      [9, 9],
      [14, 14],
    ]),
  ),
);
export const User = icon(
  "person",
  join(
    ring(7, 4, 3),
    lines([
      [1, 14],
      [2, 11],
      [4, 9],
      [10, 9],
      [12, 11],
      [13, 14],
      [1, 14],
    ]),
  ),
);
export const Bookmark = icon(
  "star",
  lines([
    [7, 0],
    [9, 5],
    [14, 5],
    [10, 8],
    [12, 14],
    [7, 10],
    [2, 14],
    [4, 8],
    [0, 5],
    [5, 5],
    [7, 0],
  ]),
  true,
);
export const Globe2 = icon(
  "globe",
  join(
    ring(7, 7, 6),
    lines(
      [
        [7, 1],
        [5, 4],
        [4, 7],
        [5, 10],
        [7, 13],
      ],
      [
        [7, 1],
        [9, 4],
        [10, 7],
        [9, 10],
        [7, 13],
      ],
      [
        [2, 4],
        [12, 4],
      ],
      [
        [1, 7],
        [13, 7],
      ],
      [
        [2, 10],
        [12, 10],
      ],
    ),
  ),
);
export const Globe = Globe2;
export const MessageCircle = icon(
  "chat",
  join(
    lines([
      [2, 1],
      [12, 1],
      [14, 3],
      [14, 9],
      [12, 11],
      [7, 11],
      [3, 14],
      [3, 11],
      [2, 11],
      [0, 9],
      [0, 3],
      [2, 1],
    ]),
    cells([4, 6], [7, 6], [10, 6]),
  ),
);
export const Settings = icon(
  "gear",
  join(
    lines([
      [6, 0],
      [9, 0],
      [9, 2],
      [11, 3],
      [13, 2],
      [14, 4],
      [12, 6],
      [12, 9],
      [14, 10],
      [13, 13],
      [11, 12],
      [9, 13],
      [9, 15],
      [6, 15],
      [6, 13],
      [4, 12],
      [2, 13],
      [1, 10],
      [3, 9],
      [3, 6],
      [1, 4],
      [2, 2],
      [4, 3],
      [6, 2],
      [6, 0],
    ]),
    ring(7, 7, 2),
  ),
);
export const X = icon(
  "close",
  lines(
    [
      [3, 3],
      [12, 12],
    ],
    [
      [12, 3],
      [3, 12],
    ],
  ),
);
export const Plus = icon(
  "plus",
  lines(
    [
      [2, 7],
      [13, 7],
    ],
    [
      [7, 2],
      [7, 13],
    ],
  ),
);
export const Minus = icon(
  "minus",
  lines([
    [2, 7],
    [13, 7],
  ]),
);
export const LocateFixed = icon(
  "recentre",
  join(
    ring(7, 7, 4),
    lines(
      [
        [7, 0],
        [7, 2],
      ],
      [
        [7, 12],
        [7, 14],
      ],
      [
        [0, 7],
        [2, 7],
      ],
      [
        [12, 7],
        [14, 7],
      ],
    ),
    cells([7, 7]),
  ),
);
export const MapPin = icon(
  "location",
  join(
    lines([
      [4, 1],
      [10, 1],
      [12, 3],
      [12, 7],
      [8, 14],
      [6, 14],
      [2, 7],
      [2, 3],
      [4, 1],
    ]),
    ring(7, 5, 1),
  ),
);
export const ChevronLeft = icon(
  "back",
  lines([
    [10, 1],
    [4, 7],
    [10, 13],
  ]),
);
export const ChevronRight = icon(
  "forward",
  lines([
    [4, 1],
    [10, 7],
    [4, 13],
  ]),
);
export const MoreHorizontal = icon(
  "more",
  cells(
    [2, 7],
    [3, 7],
    [2, 8],
    [3, 8],
    [7, 7],
    [8, 7],
    [7, 8],
    [8, 8],
    [12, 7],
    [13, 7],
    [12, 8],
    [13, 8],
  ),
);
export const Send = icon(
  "send",
  lines(
    [
      [0, 1],
      [14, 7],
      [0, 13],
      [3, 7],
      [0, 1],
    ],
    [
      [3, 7],
      [9, 7],
    ],
  ),
);
export const Copy = icon(
  "copy",
  lines(
    [
      [5, 5],
      [13, 5],
      [13, 14],
      [5, 14],
      [5, 5],
    ],
    [
      [10, 3],
      [10, 1],
      [1, 1],
      [1, 10],
      [3, 10],
    ],
  ),
);
export const Instagram = icon(
  "instagram",
  join(
    lines([
      [3, 1],
      [11, 1],
      [13, 3],
      [13, 11],
      [11, 13],
      [3, 13],
      [1, 11],
      [1, 3],
      [3, 1],
    ]),
    ring(7, 7, 3),
    cells([10, 4]),
  ),
);
export const Music2 = icon(
  "music",
  join(
    lines(
      [
        [6, 11],
        [6, 2],
        [13, 0],
        [13, 9],
      ],
      [
        [6, 4],
        [13, 2],
      ],
    ),
    ring(4, 11, 2),
    ring(11, 9, 2),
  ),
);
export const Pencil = icon(
  "edit",
  lines(
    [
      [1, 10],
      [10, 1],
      [12, 1],
      [14, 3],
      [14, 5],
      [5, 14],
      [1, 14],
      [1, 10],
    ],
    [
      [9, 2],
      [13, 6],
    ],
    [
      [1, 10],
      [5, 14],
    ],
  ),
);
export const ImagePlus = icon(
  "add-media",
  join(
    lines(
      [
        [8, 2],
        [1, 2],
        [1, 14],
        [14, 14],
        [14, 8],
      ],
      [
        [2, 11],
        [5, 8],
        [8, 11],
        [10, 9],
        [13, 12],
      ],
      [
        [10, 3],
        [15, 3],
      ],
      [
        [12, 1],
        [12, 5],
      ],
    ),
    cells([4, 5], [5, 5]),
  ),
);
export const Check = icon(
  "check",
  lines([
    [1, 8],
    [5, 12],
    [13, 3],
  ]),
);
export const Circle = icon("circle", ring(7, 7, 6));
export const Heart = icon(
  "heart",
  lines([
    [3, 2],
    [5, 2],
    [7, 4],
    [9, 2],
    [11, 2],
    [13, 4],
    [13, 7],
    [7, 13],
    [1, 7],
    [1, 4],
    [3, 2],
  ]),
  true,
);
export const Clock = icon(
  "clock",
  join(
    ring(7, 7, 6),
    lines([
      [7, 3],
      [7, 7],
      [10, 9],
    ]),
  ),
);
export const Ticket = icon(
  "ticket",
  join(
    lines([
      [0, 3],
      [14, 3],
      [14, 6],
      [13, 7],
      [14, 8],
      [14, 11],
      [0, 11],
      [0, 8],
      [1, 7],
      [0, 6],
      [0, 3],
    ]),
    cells([5, 5], [5, 7], [5, 9]),
  ),
);
export const ArrowUpRight = icon(
  "external",
  lines(
    [
      [3, 11],
      [11, 3],
    ],
    [
      [5, 3],
      [11, 3],
      [11, 9],
    ],
  ),
);
export const ImageIcon = icon(
  "image",
  join(
    lines(
      [
        [1, 2],
        [14, 2],
        [14, 13],
        [1, 13],
        [1, 2],
      ],
      [
        [2, 11],
        [5, 7],
        [8, 10],
        [10, 8],
        [13, 11],
      ],
    ),
    cells([10, 5], [11, 5]),
  ),
);
export const Star = icon(
  "star",
  lines([
    [7, 0],
    [9, 5],
    [14, 5],
    [10, 8],
    [12, 13],
    [7, 10],
    [2, 13],
    [4, 8],
    [0, 5],
    [5, 5],
    [7, 0],
  ]),
  true,
);
/** Randomise: a die showing three. */
export const Dice = icon(
  "dice",
  join(
    lines([
      [1, 1],
      [13, 1],
      [13, 13],
      [1, 13],
      [1, 1],
    ]),
    cells([4, 4], [7, 7], [10, 10]),
  ),
);
