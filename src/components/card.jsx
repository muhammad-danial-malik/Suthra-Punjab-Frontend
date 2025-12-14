import React from "react";
import * as Icons from "lucide-react";

const Card = ({ title, icon, color, onClick }) => {
  // Dynamically get the icon component
  const IconComponent = Icons[icon] || Icons.FileText;
  
  return (
    <div 
      onClick={onClick}
      className="group bg-white shadow-lg hover:shadow-2xl transition-all duration-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer border border-gray-100 hover:border-green-400 hover:-translate-y-2 relative overflow-hidden"
    >
      {/* Decorative background element */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Icon with gradient background */}
      <div className={`relative z-10 w-20 h-20 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-all duration-300`}>
        <IconComponent className="text-white" size={40} strokeWidth={2} />
      </div>
      
      {/* Title */}
      <h3 className="text-gray-700 font-semibold text-sm leading-tight group-hover:text-green-700 transition-colors duration-300 relative z-10 min-h-[40px] flex items-center">
        {title}
      </h3>
      
      {/* Hover indicator */}
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
    </div>
  );
};

export default Card;
