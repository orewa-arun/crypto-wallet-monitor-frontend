import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Settings, LogOut, User } from "lucide-react";

interface DashboardMenuProps {
  onSignOut: () => void;
}

const DashboardMenu: React.FC<DashboardMenuProps> = ({ onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right
      });
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationSettings = () => {
    setIsOpen(false);
    navigate("/notification-settings");
  };

  const handleContactBook = () => {
    setIsOpen(false);
    navigate("/contact-book");
  };

  const handleSignOut = () => {
    setIsOpen(false);
    onSignOut();
  };

  return (
    <>
      {/* Menu Button */}
      <button
        ref={buttonRef}
        onClick={handleMenuToggle}
        className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg transition duration-200 text-white"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Dropdown Menu - Fixed positioning */}
      {isOpen && (
        <div 
          ref={menuRef}
          className="fixed w-64 bg-white/25 backdrop-blur-xl rounded-xl border border-white/30 shadow-2xl z-[9999]"
          style={{
            top: menuPosition.top,
            right: menuPosition.right
          }}
        >
          <div className="py-2">
            {/* Notification Settings */}
            <button
              onClick={handleNotificationSettings}
              className="w-full flex items-center px-4 py-3 text-white hover:bg-white/20 transition duration-200"
            >
              <Settings className="w-5 h-5 mr-3 text-blue-400" />
              <span className="text-left">Notification Settings</span>
            </button>

            {/* Contact Book */}
            <button
              onClick={handleContactBook}
              className="w-full flex items-center px-4 py-3 text-white hover:bg-white/20 transition duration-200"
            >
              <User className="w-5 h-5 mr-3 text-green-400" />
              <span className="text-left">Contact Book</span>
            </button>

            {/* Divider */}
            <div className="border-t border-white/20 my-2"></div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-white hover:bg-white/20 transition duration-200"
            >
              <LogOut className="w-5 h-5 mr-3 text-red-400" />
              <span className="text-left">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardMenu; 