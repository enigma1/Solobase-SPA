import { useAccountStore } from '>/services/stores';

export const SelfCaps = () => {
  const { capabilities: grants, username } = useAccountStore(({ state }) => ({
    capabilities: state.capabilities,
    username: state.username,
  }));

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>{`Current Grants for [${username}]`}</h1>
      </div>

      <div className='area-listing'>
        {grants.map((grant, idx) => (
          <div
            key={`${idx}-${grant}`}
            className={`area-item ${idx % 2 ? 'odd' : 'even'}`}
          >
            <div className='wrap-break-word'>{grant}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
