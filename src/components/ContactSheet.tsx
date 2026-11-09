import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { Copy, Instagram } from "lucide-react";
import { toast } from "sonner";
import type { Creative } from "@/lib/data";

export function ContactSheet({
  creative,
  open,
  onOpenChange,
}: {
  creative: Creative;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const handle = `@${creative.instagram}`;
  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="mx-auto max-w-[390px] rounded-t-lg border-foreground bg-background">
        <div className="px-4 pb-8 pt-4">
          <DrawerTitle className="text-xl font-semibold">Say hi to {creative.name.split(" ")[0]}</DrawerTitle>
          <DrawerDescription className="mt-1 text-sm text-muted-foreground">
            Contact happens on Instagram. Be nice, bestie.
          </DrawerDescription>
          <div className="mt-5 flex items-center gap-3 rounded-md border border-line p-3">
            <img src={creative.avatar} alt={creative.name} className="size-10 rounded-full object-cover" />
            <div>
              <p className="font-semibold">{handle}</p>
              <p className="text-xs text-muted-foreground">{creative.role} · {creative.city}</p>
            </div>
          </div>
          <a
            href={`https://instagram.com/${creative.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-4 w-full"
          >
            <Instagram className="size-4" /> Open Instagram
          </a>
          <button
            className="btn btn-secondary mt-3 w-full"
            onClick={() => {
              navigator.clipboard?.writeText(handle).catch(() => {});
              toast(`Copied ${handle}`);
            }}
          >
            <Copy className="size-4" /> Copy handle
          </button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            We never show exact locations — neighbourhoods only.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
