import coreApi from './coreApi';

export const fetchProfiles = () => coreApi.get('/profiles/');
export const createProfile = (data) => coreApi.post('/profiles/', data);
export const updateProfile = (id, data) => coreApi.patch(`/profiles/${id}/`, data);
export const deleteProfile = (id) => coreApi.delete(`/profiles/${id}/`);
export const runWorkerWithProfile = (id) => coreApi.post(`/profiles/${id}/run/`);