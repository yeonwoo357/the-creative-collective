import type { SVGProps } from "react";
import {
  Check as LCheck,
  ChevronLeft as LChevronLeft,
  ChevronRight as LChevronRight,
  Circle as LCircle,
  Copy as LCopy,
  Earth as LEarth,
  Heart as LHeart,
  ImagePlus as LImagePlus,
  Instagram as LInstagram,
  LocateFixed as LLocateFixed,
  MapPin as LMapPin,
  MessageCircle as LMessageCircle,
  Minus as LMinus,
  MoreHorizontal as LMoreHorizontal,
  Music2 as LMusic2,
  Pencil as LPencil,
  Plus as LPlus,
  Search as LSearch,
  Send as LSend,
  Settings as LSettings,
  Star as LStar,
  UserRound as LUser,
  X as LX,
  type LucideIcon,
} from "lucide-react";

/**
 * App icons. (The file keeps its old name so every import still works.)
 * Smooth vector icons drawn at device resolution: crisp at any size, including Home and Profile.
 * `active` = selected state: a bolder stroke, and a solid fill for shapes that read well filled.
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string;
  active?: boolean;
};

function icon(name: string, Icon: LucideIcon, fillWhenActive = false) {
  function AppIcon({ size = 24, active = false, fill, strokeWidth, ...props }: IconProps) {
    const filled = (fillWhenActive && active) || (!!fill && fill !== "none");
    const labelled = !!props["aria-label"] || !!props["aria-labelledby"];
    return (
      <Icon
        size={size}
        strokeWidth={strokeWidth ?? (active ? 2.25 : 1.75)}
        fill={filled ? "currentColor" : "none"}
        aria-hidden={labelled ? undefined : true}
        role={labelled ? "img" : undefined}
        focusable="false"
        data-icon={name}
        data-active={active || filled ? "true" : "false"}
        shapeRendering="geometricPrecision"
        {...props}
      />
    );
  }
  AppIcon.displayName = `Icon(${name})`;
  return AppIcon;
}

export const Search = icon("search", LSearch);
export const User = icon("person", LUser);
export const Bookmark = icon("star", LStar, true);
export const Globe2 = icon("globe", LEarth);
export const Globe = Globe2;
export const MessageCircle = icon("chat", LMessageCircle);
export const Settings = icon("gear", LSettings);
export const X = icon("close", LX);
export const Plus = icon("plus", LPlus);
export const Minus = icon("minus", LMinus);
export const LocateFixed = icon("recentre", LLocateFixed);
export const MapPin = icon("location", LMapPin);
export const ChevronLeft = icon("back", LChevronLeft);
export const ChevronRight = icon("forward", LChevronRight);
export const MoreHorizontal = icon("more", LMoreHorizontal);
export const Send = icon("send", LSend);
export const Copy = icon("copy", LCopy);
export const Instagram = icon("instagram", LInstagram);
export const Music2 = icon("music", LMusic2);
export const Pencil = icon("edit", LPencil);
export const ImagePlus = icon("add-media", LImagePlus);
export const Check = icon("check", LCheck);
export const Circle = icon("circle", LCircle);
export const Heart = icon("heart", LHeart, true);
