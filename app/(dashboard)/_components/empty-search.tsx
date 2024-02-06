import Image from "next/image";

export const EmptySearch = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Image src="/empty-4.svg" height={300} width={300} alt="Empty search" />

      <h2 className="mt-6 text-2xl font-semibold">No results found</h2>
      <p className="mt-2 text-sm text-muted-foreground ">
        Try searching for something else
      </p>
    </div>
  );
};
