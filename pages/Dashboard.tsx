
import React, { useEffect, useState } from 'react';
import { getStudents, getRooms, getFees } from './services/mockApi';
import type { Student, Room, Fee } from '../types';
import { UserGroupIcon, BedIcon, DollarSignIcon, FileTextIcon } from '../hooks/Icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex items-center">
    <div className={`rounded-full p-3 mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    roomsOccupied: 0,
    totalRooms: 0,
    feesCollected: 0,
    totalFees: 0,
  });
  
  useEffect(() => {
    const fetchData = async () => {
      const students = await getStudents();
      const rooms = await getRooms();
      const fees = await getFees();
      
      const totalStudents = students.length;
      const roomsOccupied = rooms.filter(r => r.occupants.length > 0).length;
      const totalRooms = rooms.length;
      const feesCollected = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
      const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
      
      setStats({ totalStudents, roomsOccupied, totalRooms, feesCollected, totalFees });
    };
    fetchData();
  }, []);
  
  const roomOccupancyData = [
    { name: 'Occupied', value: stats.roomsOccupied },
    { name: 'Vacant', value: stats.totalRooms - stats.roomsOccupied }
  ];

  const feesStatusData = [
      {name: 'Fees', Collected: stats.feesCollected, Due: stats.totalFees - stats.feesCollected }
  ]
  
  const COLORS = ['#4f46e5', '#d1d5db'];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Students" value={stats.totalStudents} icon={<UserGroupIcon className="h-6 w-6 text-white"/>} color="bg-blue-500" />
        <StatCard title="Rooms Occupied" value={`${stats.roomsOccupied} / ${stats.totalRooms}`} icon={<BedIcon className="h-6 w-6 text-white"/>} color="bg-green-500" />
        <StatCard title="Fees Collected" value={`₹${stats.feesCollected.toLocaleString()}`} icon={<DollarSignIcon className="h-6 w-6 text-white"/>} color="bg-yellow-500" />
        <StatCard title="Fees Due" value={`₹${(stats.totalFees - stats.feesCollected).toLocaleString()}`} icon={<FileTextIcon className="h-6 w-6 text-white"/>} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Room Occupancy</h2>
           <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roomOccupancyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                // Fix: Guard against 'percent' not being a number to prevent arithmetic errors.
                label={({ name, percent }) => `${name} ${((typeof percent === 'number' ? percent : 0) * 100).toFixed(0)}%`}
              >
                {roomOccupancyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Fee Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={feesStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Collected" stackId="a" fill="#4ade80" />
              <Bar dataKey="Due" stackId="a" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
