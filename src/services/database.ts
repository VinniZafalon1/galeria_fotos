const DB_NAME = 'minha-galeria-db';
const DB_VERSION = 1;
export interface StoredUser { name: string; email: string; passwordHash: string; createdAt: string }
export interface Photo { id?: number; userEmail: string; dataUrl: string; createdAt: string }
function openDatabase(): Promise<IDBDatabase> { return new Promise((resolve, reject) => { const request = indexedDB.open(DB_NAME, DB_VERSION); request.onupgradeneeded = () => { const db = request.result; if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'email' }); if (!db.objectStoreNames.contains('photos')) { const photos = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true }); photos.createIndex('userEmail', 'userEmail', { unique: false }); } if (!db.objectStoreNames.contains('session')) db.createObjectStore('session', { keyPath: 'key' }); }; request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
function result<T>(request: IDBRequest<T>): Promise<T> { return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
export async function getUser(email: string) { const db = await openDatabase(); return result<StoredUser | undefined>(db.transaction('users').objectStore('users').get(email.toLowerCase())); }
export async function addUser(user: StoredUser) { const db = await openDatabase(); return result(db.transaction('users', 'readwrite').objectStore('users').add(user)); }
export async function setSession(email: string) { const db = await openDatabase(); return result(db.transaction('session', 'readwrite').objectStore('session').put({ key: 'active', email })); }
export async function getSession() { const db = await openDatabase(); const value = await result<{ key: string; email: string } | undefined>(db.transaction('session').objectStore('session').get('active')); return value?.email; }
export async function clearSession() { const db = await openDatabase(); return result(db.transaction('session', 'readwrite').objectStore('session').delete('active')); }
export async function getPhotos(userEmail: string): Promise<Photo[]> { const db = await openDatabase(); const index = db.transaction('photos').objectStore('photos').index('userEmail'); const photos = await result<Photo[]>(index.getAll(userEmail)); return photos.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
export async function addPhoto(photo: Photo) { const db = await openDatabase(); return result(db.transaction('photos', 'readwrite').objectStore('photos').add(photo)); }
export async function deletePhoto(id: number) { const db = await openDatabase(); return result(db.transaction('photos', 'readwrite').objectStore('photos').delete(id)); }
