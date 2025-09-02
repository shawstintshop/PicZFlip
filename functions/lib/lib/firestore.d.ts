import * as admin from 'firebase-admin';
export declare const db: admin.firestore.Firestore;
export declare const storage: import("firebase-admin/lib/storage/storage.js").Storage;
export declare const auth: import("firebase-admin/auth").Auth;
export declare const now: () => admin.firestore.FieldValue;
export declare const increment: (n: number) => admin.firestore.FieldValue;
export declare const arrayUnion: (...elements: any[]) => admin.firestore.FieldValue;
export declare const arrayRemove: (...elements: any[]) => admin.firestore.FieldValue;
export declare const collections: {
    users: (uid: string) => admin.firestore.DocumentReference<admin.firestore.DocumentData, admin.firestore.DocumentData>;
    analyses: (analysisId: string) => admin.firestore.DocumentReference<admin.firestore.DocumentData, admin.firestore.DocumentData>;
    inventory: (itemId: string) => admin.firestore.DocumentReference<admin.firestore.DocumentData, admin.firestore.DocumentData>;
    searchCache: (cacheId: string) => admin.firestore.DocumentReference<admin.firestore.DocumentData, admin.firestore.DocumentData>;
    errors: (errorId: string) => admin.firestore.DocumentReference<admin.firestore.DocumentData, admin.firestore.DocumentData>;
    adapterErrors: (errorId: string) => admin.firestore.DocumentReference<admin.firestore.DocumentData, admin.firestore.DocumentData>;
    sources: (sourceId: string) => admin.firestore.DocumentReference<admin.firestore.DocumentData, admin.firestore.DocumentData>;
    rateLimits: (userId: string) => admin.firestore.DocumentReference<admin.firestore.DocumentData, admin.firestore.DocumentData>;
};
export declare function batchWrite(operations: Array<{
    type: 'set' | 'update' | 'delete';
    ref: admin.firestore.DocumentReference;
    data?: any;
}>): Promise<void>;
export declare function runTransaction<T>(updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>): Promise<T>;
type WhereConstraint = {
    field: string;
    op: admin.firestore.WhereFilterOp;
    value: any;
};
export declare function createQuery<T>(collection: string, constraints?: Array<WhereConstraint | string>): admin.firestore.Query<T>;
export declare function paginateQuery<T>(query: admin.firestore.Query<T>, pageSize: number, startAfter?: admin.firestore.DocumentSnapshot): Promise<{
    data: T[];
    nextPageToken: string | undefined;
    hasMore: boolean;
}>;
export declare class FirestoreError extends Error {
    code: string;
    originalError?: any | undefined;
    constructor(message: string, code: string, originalError?: any | undefined);
}
export declare function handleFirestoreError(error: any): never;
export {};
//# sourceMappingURL=firestore.d.ts.map