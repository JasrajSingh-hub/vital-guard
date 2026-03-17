import { StoredUser, User, UserRole } from '../types';

const STORAGE_KEY = 'vitalguard_demo_users';

const rolePrefix: Record<UserRole, string> = {
  ADMIN: 'ADM',
  DOCTOR: 'DOC',
  NURSE: 'NRS',
  PATIENT: 'PAT'
};

const createUid = (role: UserRole, users: StoredUser[]): string => {
  const prefix = rolePrefix[role];
  const count = users.filter((u) => u.role === role).length + 1;
  return `${prefix}-${String(count).padStart(4, '0')}`;
};

export const getStoredUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
};

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

const normalizeUid = (value: string): string => {
  const raw = value.trim().toUpperCase().replace(/\s+/g, '');
  const match = raw.match(/^([A-Z]{3})-?(\d{4})$/);
  if (!match) return raw;
  return `${match[1]}-${match[2]}`;
};

export const signupUser = (payload: {
  name: string;
  email: string;
  role: UserRole;
}): { ok: true; user: StoredUser } | { ok: false; error: string } => {
  const users = getStoredUsers();
  const normalizedEmail = payload.email.trim().toLowerCase();
  const exists = users.some(
    (u) => u.email.toLowerCase() === normalizedEmail && u.role === payload.role
  );
  if (exists) return { ok: false, error: 'Account already exists. Use Login.' };

  const approvalStatus = payload.role === 'DOCTOR' ? 'PENDING' : 'APPROVED';

  const user: StoredUser = {
    uid: createUid(payload.role, users),
    name: payload.name.trim(),
    email: normalizedEmail,
    role: payload.role,
    approvalStatus,
    assignedPatientIds: [],
    statusMessage: approvalStatus === 'PENDING' ? 'Awaiting admin approval' : 'Active',
    createdAt: new Date().toISOString()
  };
  saveUsers([user, ...users]);
  return { ok: true, user };
};

export const loginUser = (payload: {
  email: string;
  role: UserRole;
  uid?: string;
}): { ok: true; user: User } | { ok: false; error: string } => {
  const users = getStoredUsers();
  const normalizedEmail = payload.email.trim().toLowerCase();
  let found = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.role === payload.role
  );
  if (!found) return { ok: false, error: 'No account found. Please Sign Up first.' };
  // Backward compatibility: older nurse accounts may still be marked pending.
  if (found.role === 'NURSE' && found.approvalStatus === 'PENDING') {
    const upgradedUsers = users.map((u) =>
      u.uid === found.uid ? { ...u, approvalStatus: 'APPROVED' as const, statusMessage: 'Active' } : u
    );
    saveUsers(upgradedUsers);
    found = upgradedUsers.find((u) => u.uid === found.uid) as StoredUser;
  }
  if (found.approvalStatus === 'PENDING') {
    return { ok: false, error: 'Doctor account is pending admin approval.' };
  }
  if (found.role === 'DOCTOR') {
    const providedUid = normalizeUid(payload.uid || '');
    const expectedUid = normalizeUid(found.uid);
    if (!providedUid) {
      return { ok: false, error: 'Doctor UID is required for login.' };
    }
    if (providedUid !== expectedUid) {
      return { ok: false, error: 'Invalid Doctor UID. Use the UID shown in Admin > Find Staff By UID.' };
    }
  }
  return {
    ok: true,
    user: { uid: found.uid, name: found.name, email: found.email, role: found.role }
  };
};

export const approveUser = (email: string, role: UserRole): boolean => {
  const users = getStoredUsers();
  const updated = users.map((u) =>
    u.email.toLowerCase() === email.toLowerCase() && u.role === role
      ? { ...u, approvalStatus: 'APPROVED' as const, statusMessage: 'Approved' }
      : u
  );
  saveUsers(updated);
  return true;
};

export const assignPatientsToUser = (uid: string, patientIds: string[]) => {
  const users = getStoredUsers();
  const updated = users.map((u) =>
    u.uid === uid
      ? {
          ...u,
          assignedPatientIds: patientIds,
          statusMessage: patientIds.length > 0 ? `Assigned ${patientIds.length} patient(s)` : u.statusMessage
        }
      : u
  );
  saveUsers(updated);
};
