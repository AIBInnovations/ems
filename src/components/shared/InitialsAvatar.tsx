import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials, tintIndex } from "@/lib/format";

const TINTS = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/20 text-amber-700 dark:text-amber-300",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
  "bg-primary/15 text-primary",
];

const SIZES = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-lg", xl: "h-24 w-24 text-2xl" };

export function InitialsAvatar({
  first,
  last,
  src,
  size = "md",
  className,
}: {
  first?: string;
  last?: string;
  src?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const tint = TINTS[tintIndex(`${first}${last}`, TINTS.length)];
  return (
    <Avatar className={cn(SIZES[size], className)}>
      {src ? <AvatarImage src={src} alt={`${first ?? ""} ${last ?? ""}`} /> : null}
      <AvatarFallback className={cn("font-semibold", tint)}>{initials(first, last)}</AvatarFallback>
    </Avatar>
  );
}
