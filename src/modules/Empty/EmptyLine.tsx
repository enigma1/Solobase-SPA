export const EmptyLine = ({ note }: { note?: string }) => {
  return (
    <div className='p-6 bg-white border-2 border-gray-300 shadow-md rounded-lg'>
      <label className='text-xl text-gray-800 font-semibold'>{note}</label>
    </div>
  );
};
