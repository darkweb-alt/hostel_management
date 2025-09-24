import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getStudents, addStudent, updateStudent, deleteStudent } from './services/mockApi';
import type { Student } from '../types';
import Modal from '../Modal';
import { Link } from 'react-router-dom';

const StudentForm: React.FC<{ student?: Student | null; onSave: (student: Omit<Student, 'id' | 'profilePictureUrl' | 'roomId'> | Student) => void; onCancel: () => void; }> = ({ student, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: student?.name || '',
        email: student?.email || '',
        phone: student?.phone || '',
        address: student?.address || '',
        course: student?.course || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(student ? { ...student, ...formData } : formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                {Object.entries(formData).map(([key, value]) => (
                    <div key={key}>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{key}</label>
                        <input
                            type={key === 'email' ? 'email' : 'text'}
                            name={key}
                            value={value}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            required
                        />
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700">Save</button>
            </div>
        </form>
    );
};


const StudentManagement: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchStudents = useCallback(async () => {
        const data = await getStudents();
        setStudents(data);
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);
    
    const handleSaveStudent = async (studentData: Omit<Student, 'id' | 'profilePictureUrl' | 'roomId'> | Student) => {
        if ('id' in studentData) {
            await updateStudent(studentData.id, studentData);
        } else {
            await addStudent(studentData);
        }
        fetchStudents();
        setIsModalOpen(false);
        setEditingStudent(null);
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            await deleteStudent(id);
            fetchStudents();
        }
    };

    const filteredStudents = useMemo(() => students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase())
    ), [students, searchTerm]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Student Management</h1>
                <button onClick={() => { setEditingStudent(null); setIsModalOpen(true); }} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700">Add Student</button>
            </div>

            <div className="mb-4">
                 <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
            </div>
            
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student ID</th>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Room</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => (
                            <tr key={student.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{student.id}</td>
                                <td className="px-6 py-4">{student.name}</td>
                                <td className="px-6 py-4">{student.email}</td>
                                <td className="px-6 py-4">{student.roomId || 'N/A'}</td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <Link to={`/personal-details/${student.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">View</Link>
                                    <button onClick={() => { setEditingStudent(student); setIsModalOpen(true); }} className="font-medium text-primary hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(student.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStudent ? 'Edit Student' : 'Add Student'}>
                <StudentForm student={editingStudent} onSave={handleSaveStudent} onCancel={() => { setIsModalOpen(false); setEditingStudent(null); }} />
            </Modal>
        </div>
    );
};

export default StudentManagement;