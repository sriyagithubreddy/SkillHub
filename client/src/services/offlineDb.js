import Dexie from 'dexie';

export const offlineDb = new Dexie('SkillHubOfflineDB');

offlineDb.version(2).stores({
  courses: 'id, category, platform, level, updatedAt',
  savedCourses: 'id, courseId, completed, updatedAt',
  profile: 'id, updatedAt',
  resume: 'id, updatedAt',
  certificates: 'id, issueDate, updatedAt',
  pendingActions: '++localId, type, createdAt'
});

export async function saveItems(tableName, items) {
  if (!Array.isArray(items)) return;

  const table = offlineDb.table(tableName);

  const normalized = items
    .filter(Boolean)
    .map(item => ({
      ...item,
      id: String(item.id || item._id),
      updatedAt: item.updatedAt || new Date().toISOString()
    }));

  if (normalized.length) {
    await table.bulkPut(normalized);
  }
}

export async function saveItem(tableName, item) {
  if (!item) return;

  const table = offlineDb.table(tableName);

  await table.put({
    ...item,
    id: String(item.id || item._id),
    updatedAt: item.updatedAt || new Date().toISOString()
  });
}

export async function getAllItems(tableName) {
  return offlineDb.table(tableName).toArray();
}

export async function getItem(tableName, id) {
  return offlineDb.table(tableName).get(String(id));
}

export async function deleteItem(tableName, id) {
  return offlineDb.table(tableName).delete(String(id));
}

export async function clearItems(tableName) {
  return offlineDb.table(tableName).clear();
}

export async function queueAction(type, payload) {
  return offlineDb.pendingActions.add({
    type,
    payload,
    createdAt: new Date().toISOString()
  });
}

export async function getPendingActions() {
  return offlineDb.pendingActions
    .orderBy('createdAt')
    .toArray();
}

export async function removePendingAction(localId) {
  return offlineDb.pendingActions.delete(localId);
}
