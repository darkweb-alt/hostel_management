
import React, { useState } from 'react';
import { getStudents, getRooms, getFees } from './services/mockApi';
import type { Student, Room, Fee } from '../types';
import { exportToCsv } from '../utils/helpers';

const Reports: React.FC = () => {
    
    const handleGenerateStudentList = async () => {
        const students = await getStudents();
        const studentData = students.map(({ id, name, email, phone, course, roomId }) => ({
            StudentID: id,
            Name: name,
            Email: email,
            Phone: phone,
            Course: course,
            RoomID: roomId || 'N/A'
        }));
        exportToCsv('hostel_students.csv', studentData);
    };

    const handleGenerateFeeDueReport = async () => {
        const fees = await getFees();
        const students = await getStudents();
        const dueFees = fees.filter(fee => fee.status === 'Due');
        const reportData = dueFees.map(fee => {
            const student = students.find(s => s.id === fee.studentId);
            return {
                StudentID: fee.studentId,
                StudentName: student?.name || 'N/A',
                AmountDue: fee.amount,
                DueDate: new Date(fee.dueDate).toLocaleDateString()
            };
        });
        exportToCsv('fee_due_report.csv', reportData);
    };

    const handleGenerateRoomOccupancyReport = async () => {
        const rooms = await getRooms();
        const students = await getStudents();
        const reportData = rooms.map(room => {
            const occupantNames = room.occupants.map(id => students.find(s => s.id === id)?.name).filter(Boolean).join(', ');
            return {
                RoomNumber: room.roomNumber,
                Capacity: room.capacity,
                OccupantsCount: room.occupants.length,
                Occupants: occupantNames || 'Vacant'
            };
        });
        exportToCsv('room_occupancy_report.csv', reportData);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Reports</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-3">Hostel Students List</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Download a full list of all students currently in the system.</p>
                    <button onClick={handleGenerateStudentList} className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700">Download CSV</button>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-3">Fee Due Report</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Get a list of all students with outstanding fee payments.</p>
                    <button onClick={handleGenerateFeeDueReport} className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700">Download CSV</button>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-3">Room Occupancy Report</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">View the current occupancy status of all rooms.</p>
                    <button onClick={handleGenerateRoomOccupancyReport} className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700">Download CSV</button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
