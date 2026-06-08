import { createContext, useContext, useState } from "react";

const PopupContext = createContext(null);

export function PopupProvider({ children }) {
  const [popup, setPopup] = useState(null);

  const showPopup = (
    message,
    type = "info",
    onContinue = null,
    options = {},
  ) => {
    setPopup({
      message,
      type,
      onContinue,
      showCancel: options.showCancel || false,
      continueText: options.continueText || "Continue",
      cancelText: options.cancelText || "Cancel",
    });
  };

  const closePopup = () => {
    setPopup(null);
  };

  const handleContinue = () => {
    if (popup?.onContinue) popup.onContinue();
    closePopup();
  };

  const handleCancel = () => {
    closePopup(); // ❌ just close, no action
  };

  return (
    <PopupContext.Provider value={{ showPopup }}>
      {children}

      {popup && (
        <div className="popup-overlay">
          <div className={`popup-modal ${popup.type}`}>
            <div className="popup-message">{popup.message}</div>

            <div className="popup-actions">
              {popup.showCancel && (
                <button className="popup-btn cancel" onClick={handleCancel}>
                  {popup.cancelText}
                </button>
              )}

              <button className="popup-btn" onClick={handleContinue}>
                {popup.continueText}
              </button>
            </div>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) throw new Error("usePopup must be used inside PopupProvider");
  return context;
}
