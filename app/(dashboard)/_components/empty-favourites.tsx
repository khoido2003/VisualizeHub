import Image from "next/image";

export const EmptyFavourites = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Image src="/empty-3.svg" height={400} width={400} alt="Empty search" />

      <h2 className="mt-1 text-2xl font-semibold">No favourite boards</h2>
      <p className="mt-2 text-sm text-muted-foreground ">
        Try favouriting a board
      </p>
    </div>
  );
};
