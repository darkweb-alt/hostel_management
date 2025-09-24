
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getStudents, getAttendance, markAttendance, getHistoricalAttendance } from './services/mockApi';
import type { Student, AttendanceRecord } from '../types';

const DailyAttendance: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Map<string, boolean>>(new Map());
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const fetchData = useCallback(async () => {
        const studentsData = await getStudents();
        setStudents(studentsData);
        const attendanceData = await getAttendance(date);
        const newAttendance = new Map<string, boolean>();
        studentsData.forEach(student => {
            const record = attendanceData.find(a => a.studentId === student.id);
            newAttendance.set(student.id, record ? record.present : false);
        });
        setAttendance(newAttendance);
    }, [date]);

    useEffect(() => {
        fetchData();
    }, [fetchData, date]);

    const handleAttendanceChange = (studentId: string, present: boolean) => {
        const newAttendance = new Map(attendance);
        newAttendance.set(studentId, present);
        setAttendance(newAttendance);
    };

    const handleSaveAttendance = async () => {
        const promises = Array.from(attendance.entries()).map(([studentId, present]) =>
            markAttendance(studentId, date, present)
        );
        await Promise.all(promises);
        alert('Attendance saved successfully!');
        fetchData(); // Refresh data to reflect potential new records
    };

    return (
         <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                     <h2 className="text-2xl font-bold">Mark Daily Attendance</h2>
                     <p className="text-slate-500 dark:text-slate-400">Select a date to mark attendance for students.</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                    />
                    <button onClick={handleSaveAttendance} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700">Save Attendance</button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student Name</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{student.name}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`attendance-${student.id}`}
                                                checked={attendance.get(student.id) === true}
                                                onChange={() => handleAttendanceChange(student.id, true)}
                                                className="form-radio text-primary focus:ring-primary"
                                            />
                                            <span>Present</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`attendance-${student.id}`}
                                                checked={attendance.get(student.id) === false}
                                                onChange={() => handleAttendanceChange(student.id, false)}
                                                className="form-radio text-red-500 focus:ring-red-500"
                                            />
                                            <span>Absent</span>
                                        </label>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

const AttendanceHistory: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [filters, setFilters] = useState({
        studentId: 'all',
        startDate: '',
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const loadData = async () => {
            const studentData = await getStudents();
            const attendanceData = await getHistoricalAttendance();
            setStudents(studentData);
            setRecords(attendanceData);
        };
        loadData();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);

    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            const recordDate = new Date(record.date);
            recordDate.setHours(0,0,0,0);
            
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            if(startDate) startDate.setHours(0,0,0,0);

            const endDate = filters.endDate ? new Date(filters.endDate) : null;
            if(endDate) endDate.setHours(0,0,0,0);

            if (filters.studentId !== 'all' && record.studentId !== filters.studentId) return false;
            if (startDate && recordDate < startDate) return false;
            if (endDate && recordDate > endDate) return false;
            
            return true;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [records, filters]);

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold">Historical Records</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Filter and review past attendance records.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Student</label>
                    <select id="studentId" name="studentId" value={filters.studentId} onChange={handleFilterChange} className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary">
                        <option value="all">All Students</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Start Date</label>
                    <input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary"/>
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">End Date</label>
                    <input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary"/>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                 <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student Name</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length > 0 ? filteredRecords.map(record => (
                            <tr key={record.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{studentMap.get(record.studentId) || 'Unknown'}</td>
                                <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${record.present ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                        {record.present ? 'Present' : 'Absent'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="text-center py-8 text-slate-500 dark:text-slate-400">No records found for the selected filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const Attendance: React.FC = () => {
    const [view, setView] = useState<'daily' | 'history'>('daily');

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Attendance</h1>

            <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setView('daily')}
                        className={`
                            ${view === 'daily'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary rounded-t-md
                        `}
                    >
                        Daily Marking
                    </button>
                     <button
                        onClick={() => setView('history')}
                        className={`
                            ${view === 'history'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary rounded-t-md
                        `}
                    >
                        Historical Records
                    </button>
                </nav>
            </div>
            
            {view === 'daily' && <DailyAttendance />}
            {view === 'history' && <AttendanceHistory />}

        </div>
    );
};

export default Attendance;
