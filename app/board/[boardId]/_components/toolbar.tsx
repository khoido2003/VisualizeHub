const ToolBar = () => {
  return (
    <div className="absolute left-2 top-[50%] flex -translate-y-[50%] flex-col gap-y-4 shadow-md">
      <div className="flex flex-col items-center gap-y-1 rounded-md bg-white p-1.5 shadow-md">
        <div>Pencil</div>
        <div>Square</div>
        <div>Circle</div>
        <div>Triangle</div>
      </div>

      <div className="flex flex-col items-center rounded-md bg-white p-1.5 shadow-md">
        <div>Undo</div>
        <div>Redo</div>
      </div>
    </div>
  );
};

export function ToolBarSkeleton() {
  return (
    <div className="absolute left-2 top-[50%] flex h-[360px] w-[52px] -translate-y-[50%] flex-col gap-y-4 bg-white shadow-md" />
  );
}

export default ToolBar;
