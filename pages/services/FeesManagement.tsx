
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getFees, getStudents, updateFeeStatus } from './mockApi';
import type { Fee, Student } from '../types';

const FeesManagement: React.FC = () => {
    const [fees, setFees] = useState<Fee[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [filter, setFilter] = useState<'All' | 'Paid' | 'Due'>('All');
    
    const fetchData = useCallback(async () => {
        const feesData = await getFees();
        const studentsData = await getStudents();
        setFees(feesData);
        setStudents(studentsData);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = async (feeId: string, newStatus: 'Paid' | 'Due') => {
        await updateFeeStatus(feeId, newStatus);
        fetchData();
    };

    const studentMap = useMemo(() => {
        return students.reduce((acc, student) => {
            acc[student.id] = student;
            return acc;
        }, {} as Record<string, Student>);
    }, [students]);

    const filteredFees = useMemo(() => {
        if (filter === 'All') return fees;
        return fees.filter(fee => fee.status === filter);
    }, [fees, filter]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Fees Management</h1>
            <div className="mb-4 flex space-x-2">
                {(['All', 'Paid', 'Due'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-md ${filter === status ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700'}`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student Name</th>
                            <th scope="col" className="px-6 py-3">Amount</th>
                            <th scope="col" className="px-6 py-3">Due Date</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFees.map(fee => {
                            const student = studentMap[fee.studentId];
                            return (
                                <tr key={fee.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{student?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">₹{fee.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">{new Date(fee.dueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${fee.status === 'Paid' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                            {fee.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {fee.status === 'Due' && (
                                            <button onClick={() => handleStatusChange(fee.id, 'Paid')} className="font-medium text-green-600 dark:text-green-500 hover:underline">
                                                Mark as Paid
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FeesManagement;
