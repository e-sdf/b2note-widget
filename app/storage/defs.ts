export interface StorageI<T> {
  store: (val: T) => Promise<void>;
  retrieve: () => Promise<T>;
  delete: () => Promise<void>;
}
