import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface FooterProps {
  title: string;
  authorLabel: string;
  createdAtLabel: string;
  isFavourite: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const Footer = ({
  title,
  authorLabel,
  createdAtLabel,
  disabled,
  isFavourite,
  onClick,
}: FooterProps) => {
  return (
    <div className="relative bg-white p-2">
      <p className="max-w-[calc(100%-20px)] truncate text-[13px]">{title}</p>
      <p className=" truncate text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        {authorLabel}, {createdAtLabel}
      </p>
      <button
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "absolute right-3 top-3 text-muted-foreground opacity-0 transition hover:text-yellow-400 group-hover:opacity-100 ",
          disabled && "cursor-not-allowed opacity-75",
        )}
      >
        <Star
          className={cn(
            "h-4 w-4 ",
            isFavourite && "fill-yellow-400 text-yellow-400",
          )}
        />
      </button>
    </div>
  );
};
