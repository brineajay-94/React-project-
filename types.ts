
import type { Timestamp } from 'firebase/firestore';

export interface Category {
  name: string;
  createdAt: Timestamp;
}

export interface CategoryWithId extends Category {
  id: string;
}

export interface Item {
  title: string;
  imageUrl: string;
  link: string;
  categoryId: string;
  createdAt: Timestamp;
}

export interface ItemWithId extends Item {
  id: string;
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}
