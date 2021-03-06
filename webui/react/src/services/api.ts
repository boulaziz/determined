import { CancelToken } from 'axios';

import { generateApi } from 'services/apiBuilder';
import * as Config from 'services/apiConfig';
import { ExperimentsParams, KillCommandParams, KillExpParams,
  PatchExperimentParams } from 'services/types';
import { CommandType, Credentials, Experiment, RecentTask, TaskType, User } from 'types';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const isAuthFailure = (e: any): boolean => {
  return e.response && e.response.status && e.response.status === 401;
};

// is a failure received from a failed login attempt due to bad credentials
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const isLoginFailure = (e: any): boolean => {
  return e.response && e.response.status && e.response.status === 403;
};

export const getCurrentUser = generateApi<{}, User>(Config.getCurrentUser);

export const getExperimentSummaries =
  generateApi<ExperimentsParams, Experiment[]>(Config.getExperimentSummaries);

export const killExperiment = generateApi<KillExpParams, void>(Config.killExperiment);

export const killCommand = generateApi<KillCommandParams, void>(Config.killCommand);

export const patchExperiment = generateApi<PatchExperimentParams, void>(Config.patchExperiment);

export const killTask =
  async (task: RecentTask, cancelToken?: CancelToken): Promise<void> => {
    if (task.type === TaskType.Experiment) {
      return killExperiment({ cancelToken, experimentId: parseInt(task.id) });
    }
    return killCommand({
      cancelToken,
      commandId: task.id,
      commandType: task.type as unknown as CommandType,
    });
  };

export const archiveExperiment =
  async (experimentId: number, isArchived: boolean, cancelToken?: CancelToken): Promise<void> => {
    return patchExperiment({ body: { archived: isArchived }, cancelToken, experimentId });
  };

export const login = generateApi<Credentials, void>(Config.login);

export const logout = generateApi<{}, void>(Config.logout);
