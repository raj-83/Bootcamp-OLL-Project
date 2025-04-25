import React from "react";

const UserAvatar = ({ name, size = "md", className = "" }) => {
  // Default to a placeholder if no name is provided
  const initials = name 
    ? name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : "?";

  // Size classes
  const sizeClasses = {
    xs: "h-8 w-8 text-xs",
    sm: "h-10 w-10 text-sm",
    md: "h-12 w-12 text-base",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-xl"
  };

  // Generate a consistent color based on the name (if provided)
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-teal-500"
  ];
  
  // Use a default color if no name is provided
  const colorIndex = name 
    ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    : 0;

  return (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      aria-label={name || "User"}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;