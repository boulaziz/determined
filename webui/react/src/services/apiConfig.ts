import { sha512 }  from 'js-sha512';

import { decode, ioTypeUser, ioUser } from 'ioTypes';
import { Api } from 'services/apiBuilder';
import { jsonToExperiments } from 'services/decoder';
import { ExperimentsParams, KillCommandParams, KillExpParams,
  PatchExperimentParams } from 'services/types';
import { CommandType, Credentials, Experiment, User } from 'types';

/* Helpers */

const saltAndHashPassword = (password?: string): string => {
  if (!password) return '';
  const passwordSalt = 'GubPEmmotfiK9TMD6Zdw';
  return sha512(passwordSalt + password);
};

const commandToEndpoint: Record<CommandType, string> = {
  [CommandType.Command]: '/commands',
  [CommandType.Notebook]: '/notebooks',
  [CommandType.Tensorboard]: '/tensorboard',
  [CommandType.Shell]: '/shells',
};

/* Authentication */

export const getCurrentUser:  Api<{}, User> = {
  httpOptions: () => ({ url: '/users/me' }),
  name: 'getCurrentUser',
  postProcess: (response) => {
    const result = decode<ioTypeUser>(ioUser, response.data);
    return {
      id: result.id,
      isActive: result.active,
      isAdmin: result.admin,
      username: result.username,
    };
  },
};

export const login: Api<Credentials, void> = {
  httpOptions: ({ password, username }) => {
    return {
      body: { password: saltAndHashPassword(password), username },
      method: 'POST',
      url: '/login?cookie=true',
    };
  },
  name: 'login',
};

export const logout: Api<{}, void> = {
  httpOptions: () => {
    return {
      method: 'POST',
      url: '/logout',
    };
  },
  name: 'logout',
};

/* Commands */

export const killCommand: Api<KillCommandParams, void> = {
  httpOptions: (params) => {
    return {
      method: 'DELETE',
      url: `${commandToEndpoint[params.commandType]}/${params.commandId}`,
    };
  },
  name: 'killCommand',
};

/* Experiment */

export const patchExperiment: Api<PatchExperimentParams, void> = {
  httpOptions: (params) => {
    return {
      body: params.body,
      headers: { 'content-type': 'application/merge-patch+json', 'withCredentials': true },
      method: 'PATCH',
      url: `/experiments/${params.experimentId.toString()}`,
    };
  },
  name: 'patchExperiment',
};

export const killExperiment: Api<KillExpParams, void> = {
  httpOptions: (params) => {
    return {
      method: 'POST',
      url: `/experiments/${params.experimentId.toString()}/kill`,
    };
  },
  name: 'killExperiment',
};

export const getExperimentSummaries:  Api<ExperimentsParams, Experiment[]> = {
  httpOptions: (params) => ({
    url: '/experiment-summaries' + (params.states ? '?states='+params.states.join(',') : ''),
  }),
  name: 'getExperimentSummaries',
  postProcess: (response) => jsonToExperiments(response.data),
};
