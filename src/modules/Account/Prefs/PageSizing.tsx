import { pListings, type PageListings } from '>/contracts';
import { PageSizeSelect } from '>/modules';
import { ItemPreferenceProps } from '>/types';

export const PageSizing = ({ modified, onModify }: ItemPreferenceProps) => {
  const handlePageChange = (value: number, type: PageListings) => {
    onModify({
      pageSizes: {
        ...modified.pageSizes,
        [type]: value,
      },
    });
  };

  return (
    <>
      {pListings.map((listing, idx) => {
        return (
          <div key={`${listing}-${idx}`}>
            <PageSizeSelect
              selectedSize={modified.pageSizes[listing]}
              onChange={(value) => {
                handlePageChange(Number(value), listing);
              }}
              label={`${listing}:`}
              id={listing}
            />
          </div>
        );
      })}
    </>
  );
};
