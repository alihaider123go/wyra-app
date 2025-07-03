import React from "react";

interface LoaderProps {
  width?: number;
  height?: number;
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({
  width = 24,
  height = 24,
  color = "border-gray-500"
}) => {
  return (
        <div className={`animate-spin rounded-full border-b-2 ${color} w-${width} h-${height}`}></div>    
  );
};

export default Loader;
