import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string | null;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        // Allow time for fade out animation before calling onClose
        setTimeout(onClose, 300); 
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) {
      return null;
  }

  return (
    <div
      className={`fixed top-20 right-5 z-50 p-4 rounded-full shadow-xl text-white font-medium transition-transform duration-300 ease-in-out ${
        show ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+2rem)] opacity-0'
      } bg-green-500/80 backdrop-blur-sm`}
      role="alert"
    >
      {message}
    </div>
  );
};