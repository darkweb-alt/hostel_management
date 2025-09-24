import type { Student, Room, Fee, AttendanceRecord, User } from '../types';

let mockStudents: Student[] = [
  { id: 'S001', name: 'Alice Johnson', email: 'alice@example.com', phone: '123-456-7890', address: '123 Maple St', course: 'Computer Science', profilePictureUrl: 'https://picsum.photos/seed/alice/200', roomId: 'R101' },
  { id: 'S002', name: 'Bob Smith', email: 'bob@example.com', phone: '234-567-8901', address: '456 Oak Ave', course: 'Mechanical Engineering', profilePictureUrl: 'https://picsum.photos/seed/bob/200', roomId: 'R101' },
  { id: 'S003', name: 'Charlie Brown', email: 'charlie@example.com', phone: '345-678-9012', address: '789 Pine Ln', course: 'Physics', profilePictureUrl: 'https://picsum.photos/seed/charlie/200', roomId: 'R102' },
  { id: 'S004', name: 'Diana Prince', email: 'diana@example.com', phone: '456-789-0123', address: '101 Star Blvd', course: 'History', profilePictureUrl: 'https://picsum.photos/seed/diana/200', roomId: 'R103' },
  { id: 'S005', name: 'Ethan Hunt', email: 'ethan@example.com', phone: '567-890-1234', address: '202 Mission Rd', course: 'Kinesiology', profilePictureUrl: 'https://picsum.photos/seed/ethan/200', roomId: null },
];

let mockRooms: Room[] = [
  { id: 'R101', roomNumber: '101', capacity: 2, occupants: ['S001', 'S002'] },
  { id: 'R102', roomNumber: '102', capacity: 2, occupants: ['S003'] },
  { id: 'R103', roomNumber: '103', capacity: 2, occupants: ['S004'] },
  { id: 'R201', roomNumber: '201', capacity: 2, occupants: [] },
  { id: 'R202', roomNumber: '202', capacity: 2, occupants: [] },
];

let mockFees: Fee[] = [
  { id: 'F01', studentId: 'S001', amount: 5000, status: 'Paid', dueDate: '2024-08-01' },
  { id: 'F02', studentId: 'S002', amount: 5000, status: 'Due', dueDate: '2024-08-01' },
  { id: 'F03', studentId: 'S003', amount: 5000, status: 'Paid', dueDate: '2024-08-01' },
  { id: 'F04', studentId: 'S004', amount: 5000, status: 'Due', dueDate: '2024-08-01' },
  { id: 'F05', studentId: 'S005', amount: 5000, status: 'Due', dueDate: '2024-08-01' },
];

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const dayBeforeYesterday = new Date();
dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);


let mockAttendance: AttendanceRecord[] = [
  {id: 'A01', studentId: 'S001', date: new Date().toISOString().split('T')[0], present: true},
  {id: 'A02', studentId: 'S002', date: new Date().toISOString().split('T')[0], present: false},
  {id: 'A03', studentId: 'S003', date: new Date().toISOString().split('T')[0], present: true},
  {id: 'A04', studentId: 'S001', date: yesterday.toISOString().split('T')[0], present: true},
  {id: 'A05', studentId: 'S002', date: yesterday.toISOString().split('T')[0], present: true},
  {id: 'A06', studentId: 'S003', date: yesterday.toISOString().split('T')[0], present: false},
  {id: 'A07', studentId: 'S001', date: dayBeforeYesterday.toISOString().split('T')[0], present: false},
  {id: 'A08', studentId: 'S002', date: dayBeforeYesterday.toISOString().split('T')[0], present: true},
];

const simulateDelay = <T,>(data: T): Promise<T> => new Promise(res => setTimeout(() => res(data), 300));

// --- Auth ---
export const getAdminUser = (): User => ({ id: 'admin01', email: 'admin@hms.com', role: 'admin' });
export const getStudentUser = (studentId: string, email: string): User => ({ id: `user-${studentId}`, email, role: 'student', studentId });

// --- Students ---
export const getStudents = () => simulateDelay([...mockStudents]);
export const getStudentById = (id: string) => {
    // Fix: Removed the 'all' case to ensure a consistent return type of { student: Student | undefined }.
    // This resolves the type error in consuming components like PersonalDetails.
    const student = mockStudents.find(s => s.id === id);
    return simulateDelay({ student });
};
export const addStudent = (studentData: Omit<Student, 'id' | 'profilePictureUrl' | 'roomId'>) => {
  const newStudent: Student = {
    ...studentData,
    id: `S${String(mockStudents.length + 1).padStart(3, '0')}`,
    profilePictureUrl: 'https://picsum.photos/seed/new/200',
    roomId: null,
  };
  mockStudents.push(newStudent);
  return simulateDelay(newStudent);
};
export const updateStudent = (id: string, updates: Partial<Student>) => {
  mockStudents = mockStudents.map(s => (s.id === id ? { ...s, ...updates } : s));
  const updatedStudent = mockStudents.find(s => s.id === id);
  return simulateDelay(updatedStudent!);
};
export const deleteStudent = (id: string) => {
  mockStudents = mockStudents.filter(s => s.id !== id);
  return simulateDelay({ success: true });
};
export const uploadProfilePicture = (studentId: string, file: File) => {
    // Simulates uploading to Firebase Storage and returning a URL
    return new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            mockStudents = mockStudents.map(s => s.id === studentId ? { ...s, profilePictureUrl: dataUrl } : s);
            resolve(dataUrl);
        };
        reader.readAsDataURL(file);
    });
};

// --- Rooms ---
export const getRooms = () => simulateDelay([...mockRooms]);
export const allocateRoom = (studentId: string, roomId: string) => {
  const room = mockRooms.find(r => r.id === roomId);
  if (!room || room.occupants.length >= room.capacity) return simulateDelay({ success: false, message: 'Room is full or does not exist.' });
  
  // De-allocate from old room if exists
  mockRooms.forEach(r => {
      r.occupants = r.occupants.filter(id => id !== studentId);
  });
  mockStudents.forEach(s => {
      if(s.roomId) {
         const oldRoom = mockRooms.find(r => r.id === s.roomId);
         if(oldRoom) {
             oldRoom.occupants = oldRoom.occupants.filter(occId => occId !== studentId);
         }
      }
  });


  room.occupants.push(studentId);
  mockStudents = mockStudents.map(s => s.id === studentId ? { ...s, roomId } : s);
  
  return simulateDelay({ success: true });
};
export const deallocateRoom = (studentId: string) => {
  const student = mockStudents.find(s => s.id === studentId);
  if (!student || !student.roomId) return simulateDelay({ success: false, message: 'Student not in a room.' });

  const room = mockRooms.find(r => r.id === student.roomId);
  if (room) {
    room.occupants = room.occupants.filter(id => id !== studentId);
  }
  
  mockStudents = mockStudents.map(s => s.id === studentId ? { ...s, roomId: null } : s);
  return simulateDelay({ success: true });
}


// --- Fees ---
export const getFees = () => simulateDelay([...mockFees]);
export const updateFeeStatus = (feeId: string, status: 'Paid' | 'Due') => {
  mockFees = mockFees.map(f => f.id === feeId ? { ...f, status } : f);
  const updatedFee = mockFees.find(f => f.id === feeId);
  return simulateDelay(updatedFee!);
}

// --- Attendance ---
export const getAttendance = (date: string) => simulateDelay(mockAttendance.filter(a => a.date === date));
export const getHistoricalAttendance = () => simulateDelay([...mockAttendance]);
export const markAttendance = (studentId: string, date: string, present: boolean) => {
  const existingRecord = mockAttendance.find(a => a.studentId === studentId && a.date === date);
  if (existingRecord) {
    existingRecord.present = present;
  } else {
    mockAttendance.push({ id: `A${mockAttendance.length + 1}`, studentId, date, present });
  }
  return simulateDelay({ success: true });
}