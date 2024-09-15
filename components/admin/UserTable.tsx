import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { firestore } from '@/firebase/firebase'; // Adjust the import path as needed
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  // Add more fields as needed
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [sortField, setSortField] = useState<'firstName' | 'email' | 'role'>('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterRole, setFilterRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, [sortField, sortOrder, filterRole]);

  const fetchUsers = async () => {
    const usersRef = collection(firestore, 'users');
    let q = query(usersRef, orderBy(sortField === 'firstName' ? 'firstName' : sortField, sortOrder));

    if (filterRole) {
      q = query(q, where('role', '==', filterRole));
    }

    const querySnapshot = await getDocs(q);
    const fetchedUsers: User[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      firstName: doc.data().firstName || '',
      lastName: doc.data().lastName || '',
      email: doc.data().email || '',
      role: doc.data().role || '',
    }));

    setUsers(fetchedUsers);
  };

  const handleSort = (field: 'firstName' | 'email' | 'role') => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredUsers = users.filter(user =>
    (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Student Information</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="max-w-[180px]">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('firstName')}>
                Name {sortField === 'firstName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
                Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('role')}>
                Role {sortField === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserTable;