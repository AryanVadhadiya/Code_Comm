import React from 'react';
import './users.css';

const Users = ({ initials }) => {
  const gradientColor = `linear-gradient(135deg, #f0f0f0, #d0d0d0)`;

  return (
    <div className="user-avatar" style={{ background: gradientColor }}>
      {initials}
    </div>
  );
};

export default Users;
