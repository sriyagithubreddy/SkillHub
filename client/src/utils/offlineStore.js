import {
  saveItems,
  saveItem,
  getAllItems,
  getItem,
  queueAction,
  getPendingActions,
  removePendingAction,
  deleteItem,
  offlineDb
} from '../services/offlineDb';

export const cacheSavedCourses = async (savedCourses) => {
  if (!Array.isArray(savedCourses)) return;

  await offlineDb.savedCourses.clear();

  for (const item of savedCourses) {
    if (!item) continue;

    await saveItem('savedCourses', {
      ...item,
      id: String(item._id || item.id)
    });
  }
};

export const getCachedSavedCourses = async () => {
  return getAllItems('savedCourses');
};

export const cacheResumeDraft = async (resume) => {
  if (!resume) return;

  await saveItem('resume', {
    ...resume,
    id: 'current'
  });
};

export const getCachedResumeDraft = async () => {
  return getItem('resume', 'current');
};

export const cacheProfile = async (user) => {
  if (!user) return;

  await saveItem('profile', {
    ...user,
    id: 'current'
  });
};

export const getCachedProfile = async () => {
  return getItem('profile', 'current');
};

export const cacheCertificates = async (certificates) => {
  if (!Array.isArray(certificates)) return;

  await offlineDb.certificates.clear();

  for (const certificate of certificates) {
    if (!certificate) continue;

    await saveItem('certificates', {
      ...certificate,
      id: String(certificate._id || certificate.id)
    });
  }
};

export const getCachedCertificates = async () => {
  return getAllItems('certificates');
};

export const queuePendingSync = async (action) => {
  return queueAction(
    action.type || 'UNKNOWN',
    action
  );
};

export const getPendingSyncQueue = async () => {
  return getPendingActions();
};

export const clearPendingSyncQueue = async () => {
  const actions = await getPendingActions();

  await Promise.all(
    actions.map(action => removePendingAction(action.localId))
  );
};
