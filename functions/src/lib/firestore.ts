import * as admin from 'firebase-admin';
import { ENV } from '../env.js';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: ENV.FIREBASE_PROJECT_ID,
      privateKey: ENV.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: ENV.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: `${ENV.FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

// Export Firestore instance
export const db = admin.firestore();
export const storage = admin.storage();
export const auth = admin.auth();

// Utility functions
export const now = () => admin.firestore.FieldValue.serverTimestamp();
export const increment = (n: number) => admin.firestore.FieldValue.increment(n);
export const arrayUnion = (...elements: any[]) => admin.firestore.FieldValue.arrayUnion(...elements);
export const arrayRemove = (...elements: any[]) => admin.firestore.FieldValue.arrayRemove(...elements);

// Collection references
export const collections = {
  users: (uid: string) => db.collection('users').doc(uid),
  analyses: (analysisId: string) => db.collection('analyses').doc(analysisId),
  inventory: (itemId: string) => db.collection('inventory').doc(itemId),
  searchCache: (cacheId: string) => db.collection('searchCache').doc(cacheId),
  errors: (errorId: string) => db.collection('errors').doc(errorId),
  adapterErrors: (errorId: string) => db.collection('adapter_errors').doc(errorId),
  sources: (sourceId: string) => db.collection('sources').doc(sourceId),
  rateLimits: (userId: string) => db.collection('rateLimits').doc(userId),
};

// Batch operations
export async function batchWrite(operations: Array<{
  type: 'set' | 'update' | 'delete';
  ref: admin.firestore.DocumentReference;
  data?: any;
}>): Promise<void> {
  const batch = db.batch();
  
  operations.forEach(op => {
    switch (op.type) {
      case 'set':
        batch.set(op.ref, op.data!);
        break;
      case 'update':
        batch.update(op.ref, op.data!);
        break;
      case 'delete':
        batch.delete(op.ref);
        break;
    }
  });
  
  await batch.commit();
}

// Transaction operations
export async function runTransaction<T>(
  updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>
): Promise<T> {
  return db.runTransaction(updateFunction);
}

// Query builders
export function createQuery<T>(
  collection: string,
  constraints: Array<admin.firestore.WhereFilterOp | admin.firestore.OrderByDirection> = []
): admin.firestore.Query<T> {
  let query: admin.firestore.Query<T> = db.collection(collection) as any;
  
  constraints.forEach(constraint => {
    if (typeof constraint === 'string') {
      // Order by
      query = query.orderBy(constraint);
    } else {
      // Where filter
      query = query.where(constraint.field, constraint.op, constraint.value);
    }
  });
  
  return query;
}

// Pagination helper
export async function paginateQuery<T>(
  query: admin.firestore.Query<T>,
  pageSize: number,
  startAfter?: admin.firestore.DocumentSnapshot
): Promise<{
  data: T[];
  nextPageToken?: string;
  hasMore: boolean;
}> {
  let paginatedQuery = query.limit(pageSize);
  
  if (startAfter) {
    paginatedQuery = paginatedQuery.startAfter(startAfter);
  }
  
  const snapshot = await paginatedQuery.get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const hasMore = snapshot.docs.length === pageSize;
  const nextPageToken = hasMore ? snapshot.docs[snapshot.docs.length - 1].id : undefined;
  
  return { data, nextPageToken, hasMore };
}

// Error handling
export class FirestoreError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'FirestoreError';
  }
}

export function handleFirestoreError(error: any): never {
  if (error.code === 'permission-denied') {
    throw new FirestoreError('Access denied', 'PERMISSION_DENIED', error);
  } else if (error.code === 'not-found') {
    throw new FirestoreError('Document not found', 'NOT_FOUND', error);
  } else if (error.code === 'already-exists') {
    throw new FirestoreError('Document already exists', 'ALREADY_EXISTS', error);
  } else if (error.code === 'resource-exhausted') {
    throw new FirestoreError('Resource exhausted', 'RESOURCE_EXHAUSTED', error);
  } else {
    throw new FirestoreError('Database error', 'UNKNOWN', error);
  }
}
