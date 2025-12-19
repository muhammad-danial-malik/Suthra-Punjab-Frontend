import React from "react";
import { X } from "lucide-react";

function ImageModal({ src, alt = "Image", onClose }) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-7xl max-h-screen w-full h-full flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-200 transition-colors shadow-lg z-10 cursor-pointer"
          aria-label="Close image"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>

        {/* Image */}
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

export default ImageModal;
