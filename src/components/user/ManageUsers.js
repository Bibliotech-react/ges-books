import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';

const ManageUsers = () => {
  const { user, getAllUsers, updateUserRole, deleteUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userList = await getAllUsers();
        setUsers(userList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [getAllUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ));
        setSuccess('User role updated successfully');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        setError(null);
        const result = await deleteUser(userId);
        if (result.success) {
          setUsers(users.filter(u => u.id !== userId));
          setSuccess('User deleted successfully');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Manage Users</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((userItem) => (
            <tr key={userItem.id}>
              <td>{userItem.id}</td>
              <td>{userItem.firstName} {userItem.lastName}</td>
              <td>{userItem.email}</td>
              <td>
                <select
                  value={userItem.role}
                  onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                  disabled={userItem.id === user?.id} // Don't let admins change their own role
                  className="form-select"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteUser(userItem.id)}
                  disabled={userItem.id === user?.id} // Don't let admins delete themselves
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ManageUsers;