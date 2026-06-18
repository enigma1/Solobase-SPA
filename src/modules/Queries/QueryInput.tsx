import { useState, KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { trimString } from '>/services/utils';
import {
  useDialogStore,
  useHistoryStore,
  useAccountStore,
} from '>/services/stores';
import { queryKeys } from '>/services/queryHooks';
import { useErrorDialog } from '>/services/hooks';
import { ScreenLoader } from '>/modules';
import { routes } from '>/config/routes';

export const QueryInput = () => {
  return null;
};
