import Image from "next/image";
import atithiraLogo from "@/assets/atithira.png";

export function BrandLogo({
  className = "h-8 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={atithiraLogo}
      alt="Atithira"
      className={className}
      priority={priority}
    />
  );
}

export function BrandLogoBadge({
  logoClassName = "h-7 w-auto max-w-[8rem] object-contain",
  className = "inline-flex items-center rounded-xl bg-brand-700 px-3 py-2 shadow-sm",
  priority = false,
}: {
  logoClassName?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={className}>
      <BrandLogo className={logoClassName} priority={priority} />
    </span>
  );
}
