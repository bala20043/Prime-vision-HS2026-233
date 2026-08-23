import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, MessageSquare, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const getInitial = (name) => {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-button
                   text-parchment hover:bg-parchment/10 transition-colors duration-fast"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-gold text-ink font-semibold
                        flex items-center justify-center text-small font-mono shadow-sm">
          {getInitial(user.name)}
        </div>
        <span className="font-medium text-body text-parchment max-w-[140px] truncate hidden sm:inline">
          {user.name}
        </span>
        <ChevronDown size={16} className={`text-parchment/70 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-card shadow-elevated
                        border border-hairline py-1 z-50 text-ink">
          {/* User info summary */}
          <div className="px-4 py-3 border-b border-hairline bg-parchment/40">
            <p className="text-body font-semibold text-ink truncate">{user.name}</p>
            <p className="text-micro text-muted-text font-mono truncate">{user.email}</p>
          </div>

          {/* Links */}
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-small text-ink
                       hover:bg-parchment/70 transition-colors no-underline"
          >
            <User size={16} className="text-indigo" />
            Profile
          </Link>

          <Link
            to="/assistant"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-small text-ink
                       hover:bg-parchment/70 transition-colors no-underline"
          >
            <MessageSquare size={16} className="text-indigo" />
            My Chats
          </Link>

          <div className="border-t border-hairline my-1" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-small text-error-rust
                       hover:bg-error-rust/5 transition-colors text-left font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
