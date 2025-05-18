import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. First create the context
const AuthContext = createContext();

// 2. Define the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock database for demo purposes
  const mockDatabase = {
    users: [
      {
        id: '1',
        email: 'admin@bibliotech.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'System',
        role: 'admin',
        token: 'admin-token'
      },
      {
        id: '2',
        email: 'john.doe@email.com',
        password: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        readingProgress: 35,
        books: ['book1', 'book3'],
        token: 'user-token'
      }
    ],
    books: [
      { id: 'book1', title: 'Book One', author: 'Author A' },
      { id: 'book2', title: 'Book Two', author: 'Author B' },
      { id: 'book3', title: 'Book Three', author: 'Author C' }
    ]
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const foundUser = mockDatabase.users.find(u => 
        u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      const { password: _, ...userData } = foundUser;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const emailExists = mockDatabase.users.some(u => u.email === userData.email);
      if (emailExists) {
        throw new Error('Email already registered');
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        role: 'user',
        readingProgress: 0,
        books: [],
        token: `user-token-${Date.now()}`
      };

      mockDatabase.users.push(newUser);
      
      const { password: _, ...userWithoutPassword } = newUser;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  // ADMIN FUNCTIONS
  const getAllUsers = () => {
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    return mockDatabase.users.map(u => {
      const { password, token, ...safeUser } = u;
      return safeUser;
    });
  };

  const updateUserRole = (userId, newRole) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    const userToUpdate = mockDatabase.users.find(u => u.id === userId);
    if (userToUpdate) {
      userToUpdate.role = newRole;
      return { success: true };
    }
    return { success: false, error: 'User not found' };
  };

  const deleteUser = (userId) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    const index = mockDatabase.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      mockDatabase.users.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: 'User not found' };
  };

  const getAllBooks = () => {
    return mockDatabase.books;
  };

  const addBook = (bookData) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    const newBook = {
      id: `book${mockDatabase.books.length + 1}`,
      ...bookData
    };
    mockDatabase.books.push(newBook);
    return { success: true, book: newBook };
  };

  // USER FUNCTIONS
  const updateProfile = (profileData) => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    const updatedUser = { ...user, ...profileData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return { success: true, user: updatedUser };
  };

  const updateReadingProgress = (progress) => {
    if (!user || user.role !== 'user') {
      throw new Error('Unauthorized');
    }
    const updatedUser = { ...user, readingProgress: progress };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return { success: true, user: updatedUser };
  };

  const addReview = (bookId, review) => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    return { success: true, review };
  };

  const submitForumPost = (post) => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    return { success: true, post };
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: () => user?.role === 'admin',
    isUser: () => user?.role === 'user',
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => roles.includes(user?.role),
    
    // Auth functions
    login,
    register,
    logout,
    
    // Admin functions
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllBooks,
    addBook,
    
    // User functions
    updateProfile,
    updateReadingProgress,
    addReview,
    submitForumPost,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Define and export the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};