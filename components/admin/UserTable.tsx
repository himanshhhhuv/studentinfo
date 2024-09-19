import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Key } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string; // Add this line
  role: 'student' | 'teacher' | 'admin';
}

interface UserTableProps {
  users: User[];
  onRoleChange: (userId: string, newRole: 'student' | 'teacher' | 'admin') => void;
  onDeleteUser: (userId: string) => void;
  onEditUser: (user: User) => void;
  onResetPassword: (email: string) => void; // Changed to expect email instead of userId
  onCreateUser: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  onRoleChange, 
  onDeleteUser, 
  onEditUser, 
  onResetPassword,
  onCreateUser
}) => {
  const [sortField, setSortField] = useState<'firstName' | 'email' | 'role' | 'phoneNumber'>('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSort = (field: 'firstName' | 'email' | 'role' | 'phoneNumber') => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedAndFilteredUsers = users
    .filter(user => filterRole === 'all' || user.role === filterRole)
    .sort((a, b) => {
      if (sortField === 'firstName') {
        return sortOrder === 'asc' 
          ? a.firstName.localeCompare(b.firstName) 
          : b.firstName.localeCompare(a.firstName);
      } else if (sortField === 'email') {
        return sortOrder === 'asc' 
          ? a.email.localeCompare(b.email) 
          : b.email.localeCompare(a.email);
      } else if (sortField === 'phoneNumber') { // Add this block
        return sortOrder === 'asc' 
          ? a.phoneNumber.localeCompare(b.phoneNumber) 
          : b.phoneNumber.localeCompare(a.phoneNumber);
      } else {
        return sortOrder === 'asc' 
          ? a.role.localeCompare(b.role) 
          : b.role.localeCompare(a.role);
      }
    });

  const filteredUsers = sortedAndFilteredUsers.filter(user =>
    (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.phoneNumber.includes(searchTerm)) // Add this line
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Information</h1>
        <Button onClick={onCreateUser}>Create New User</Button>
      </div>
      
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
              <TableHead className="cursor-pointer" onClick={() => handleSort('phoneNumber')}>
                Phone {sortField === 'phoneNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('role')}>
                Role {sortField === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>
                  <Select 
                    value={user.role} 
                    onValueChange={(newRole) => onRoleChange(user.id, newRole as 'student' | 'teacher' | 'admin')}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin" className="text-red-500 hover:text-red-600">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {/* <Button 
                      onClick={() => onEditUser(user)} 
                      variant="outline" 
                      size="icon"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button> */}
                    <Button 
                      onClick={() => onDeleteUser(user.id)} 
                      variant="outline" 
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                    </Button>
                    <Button 
                      onClick={() => onResetPassword(user.email)} // Changed to use email
                      variant="outline" 
                      size="icon"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserTable;