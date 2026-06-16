export const EmptyLine = ({ note }: { note?: string }) => {
  return (
    <div className='p-6 shadow-md rounded-lg'>
      <label className='text-xl font-semibold'>{note}</label>
    </div>
  );
};
