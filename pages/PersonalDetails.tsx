
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getStudentById, uploadProfilePicture } from './services/mockApi';
import type { Student } from '../types';

const DetailItem: React.FC<{ label: string; value: string | null }> = ({ label, value }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">{value || 'N/A'}</dd>
    </div>
);

const PersonalDetails: React.FC = () => {
    const { user } = useAuth();
    const { studentId } = useParams();
    const [student, setStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const targetStudentId = user?.role === 'admin' && studentId ? studentId : user?.studentId;

    const fetchStudentData = useCallback(async () => {
        if (!targetStudentId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const { student: studentData } = await getStudentById(targetStudentId);
        if (studentData) {
            setStudent(studentData);
        }
        setIsLoading(false);
    }, [targetStudentId]);

    useEffect(() => {
        fetchStudentData();
    }, [fetchStudentData]);

    const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && targetStudentId) {
            const file = e.target.files[0];
            const newUrl = await uploadProfilePicture(targetStudentId, file);
            setStudent(prev => prev ? { ...prev, profilePictureUrl: newUrl } : null);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!student) {
        return <div className="text-center text-xl">Student details not found.</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Personal Details</h1>
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
                <div className="md:flex">
                    <div className="md:flex-shrink-0 p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-700">
                        <img className="h-48 w-48 rounded-full object-cover" src={student.profilePictureUrl} alt="Profile" />
                        <label htmlFor="picture-upload" className="mt-4 cursor-pointer px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary-700">
                            Upload Photo
                        </label>
                        <input id="picture-upload" type="file" accept="image/jpeg, image/png" className="hidden" onChange={handlePictureUpload} />
                    </div>
                    <div className="p-8 flex-grow">
                        <h2 className="text-2xl font-bold text-primary">{student.name}</h2>
                        <p className="text-slate-500 dark:text-slate-400">{student.course}</p>
                        <div className="mt-6 border-t border-slate-200 dark:border-slate-600">
                            <dl className="divide-y divide-slate-200 dark:divide-slate-600">
                                <DetailItem label="Student ID" value={student.id} />
                                <DetailItem label="Email" value={student.email} />
                                <DetailItem label="Phone" value={student.phone} />
                                <DetailItem label="Address" value={student.address} />
                                <DetailItem label="Room ID" value={student.roomId} />
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalDetails;
