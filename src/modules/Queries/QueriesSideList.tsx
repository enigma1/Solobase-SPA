import { useNavigate, useLocation } from 'react-router-dom';
import { useQueriesStore } from '>/services/stores';
import { routes } from '>/config';

export const QueriesSideList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { getQueries, getQueriesCount, isQuerySelected, selectQuery } =
    useQueriesStore(({ api }) => ({
      getQueries: api.getQueries,
      getQueriesCount: api.getQueriesCount,
      isQuerySelected: api.isQuerySelected,
      selectQuery: api.selectQuery,
    }));

  const handleQueryChange = async (title: string) => {
    selectQuery(title);
    if (location.pathname !== routes.front.queryView) {
      navigate(routes.front.queryView);
    }
  };

  if (!getQueriesCount()) {
    return <div className='side-list-empty'>No Queries</div>;
  }

  return (
    <>
      <div className='side-list'>
        {Object.keys(getQueries()).map((title, idx) => {
          const isSelected = isQuerySelected(title);
          return (
            <button
              key={`${title}-${idx}`}
              className='side-list-item'
              data-active={isSelected}
              onClick={() => handleQueryChange(title)}
            >
              {title}
            </button>
          );
        })}
      </div>
    </>
  );
};
