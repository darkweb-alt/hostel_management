import React, { useState, useEffect, useCallback } from 'react';
import { getRooms, getStudents, allocateRoom, deallocateRoom } from './services/mockApi';
import type { Room, Student } from '../types';
import Modal from '../Modal';

const RoomCard: React.FC<{ room: Room; students: Student[]; onAllocate: (roomId: string) => void; onDeallocate: (studentId: string) => void; }> = ({ room, students, onAllocate, onDeallocate }) => {
    const isFull = room.occupants.length >= room.capacity;
    const occupantsDetails = room.occupants.map(id => students.find(s => s.id === id)).filter(Boolean) as Student[];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold">Room {room.roomNumber}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isFull ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                        {room.occupants.length} / {room.capacity}
                    </span>
                </div>
                <div className="space-y-2">
                    {occupantsDetails.map(student => (
                        <div key={student.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-2 rounded">
                            <span className="text-sm">{student.name}</span>
                            <button onClick={() => onDeallocate(student.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                        </div>
                    ))}
                </div>
            </div>
            <button
                onClick={() => onAllocate(room.id)}
                disabled={isFull}
                className="mt-4 w-full px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
                Allocate
            </button>
        </div>
    );
};

const AllocationModal: React.FC<{ unallocatedStudents: Student[]; onAllocate: (studentId: string) => void; onCancel: () => void; }> = ({ unallocatedStudents, onAllocate, onCancel }) => {
    const [selectedStudent, setSelectedStudent] = useState<string>('');

    return (
        <div>
            <h3 className="mb-4">Select a student to allocate:</h3>
            <select
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
            >
                <option value="" disabled>-- Select Student --</option>
                {unallocatedStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
            </select>
            <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                <button onClick={() => onAllocate(selectedStudent)} disabled={!selectedStudent} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 disabled:bg-slate-400">Allocate</button>
            </div>
        </div>
    );
};

const RoomAllocation: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        const roomsData = await getRooms();
        const studentsData = await getStudents();
        setRooms(roomsData);
        setStudents(studentsData);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAllocateClick = (roomId: string) => {
        setSelectedRoom(roomId);
        setIsModalOpen(true);
    };

    const handleAllocateStudent = async (studentId: string) => {
        if (selectedRoom) {
            await allocateRoom(studentId, selectedRoom);
            fetchData();
            setIsModalOpen(false);
            setSelectedRoom(null);
        }
    };

    const handleDeallocate = async (studentId: string) => {
        if(window.confirm('Are you sure you want to de-allocate this student?')) {
            await deallocateRoom(studentId);
            fetchData();
        }
    };
    
    const unallocatedStudents = students.filter(s => !s.roomId);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Room Allocation</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {rooms.map(room => (
                    <RoomCard key={room.id} room={room} students={students} onAllocate={handleAllocateClick} onDeallocate={handleDeallocate}/>
                ))}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Allocate to Room ${rooms.find(r=>r.id === selectedRoom)?.roomNumber || ''}`}>
                <AllocationModal unallocatedStudents={unallocatedStudents} onAllocate={handleAllocateStudent} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default RoomAllocation;