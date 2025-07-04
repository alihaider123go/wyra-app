import React from "react";

const btn = ({
  btnText,
  loading,
  loadingText = "Loading...",
  onClick,
  className
}: {
  btnText: string;
  loading?: boolean;
  loadingText?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}) => {
  return (
    <button
      disabled={loading}
      onClick={onClick}
      className={`${
        loading ? "bg-gray-600" : "bg-blue-600"
      } rounded-md w-full px-12 py-3 text-sm font-medium text-white ${className}`}
    >
      {loading ? loadingText : btnText}
    </button>
  );
};

export default btn;
