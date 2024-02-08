const Info = () => {
  return (
    <div className="absolute left-2 top-2 flex h-12 items-center rounded-md bg-white px-1.5 shadow-md">
      TODO: INFORMATION ABOUT THE BOARD
    </div>
  );
};

Info.Skeleton = function InfoSkeleton() {
  return (
    <div className="absolute left-2 top-2 flex h-12 w-[300px] items-center rounded-md bg-white px-1.5 shadow-md" />
  );
};

export default Info;