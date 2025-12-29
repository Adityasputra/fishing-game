export default function Logout({ user, onLogout, onShowConvert }) {
  return (
    <div className="flex-1 flex justify-end gap-2">
      {user?.isGuest && (
        <button
          onClick={onShowConvert}
          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-lg hover:shadow-xl flex items-center gap-1.5"
          title="Save your progress"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          Save
        </button>
      )}
      <button
        onClick={onLogout}
        className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition-all border border-white/30 hover:border-white/50 flex items-center gap-1.5"
        title="Logout"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Logout
      </button>
    </div>
  );
}
