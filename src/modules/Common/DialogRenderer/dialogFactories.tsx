import { DatabaseNew, TableNew } from '>/modules';
import { DialogPayload } from '>/types';

export const dialogFactories: Record<string, () => DialogPayload> = {
  createDatabase: () => ({
    caption: 'Database Forms',
    component: <DatabaseNew />,
    variant: 'success',
  }),
};
