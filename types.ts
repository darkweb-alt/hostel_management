
export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  studentId?: string; // only for student role
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  course: string;
  profilePictureUrl: string;
  roomId: string | null;
}

export interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  occupants: string[]; // array of student IDs
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  status: 'Paid' | 'Due';
  dueDate: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  present: boolean;
}
