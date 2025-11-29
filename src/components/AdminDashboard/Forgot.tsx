import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface ValidationRule {
  label: string;
  test: (password: string) => boolean;
}

function Forgot() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validationRules: ValidationRule[] = [
    {
      label: 'At least 1 upper case letter (A-Z)',
      test: (pwd) => /[A-Z]/.test(pwd)
    },
    {
      label: 'At least 1 number (0-9)',
      test: (pwd) => /[0-9]/.test(pwd)
    },
    {
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8
    }
  ];

  const allRulesPassed = validationRules.every(rule => rule.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';
  const canSubmit = allRulesPassed && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      setShowSuccess(true);
      setTimeout(() => {
        setNewPassword('');
        setConfirmPassword('');
        setShowSuccess(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Change your password</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="Confirm new password"
            />
          </div>

          {(isPasswordFocused || newPassword) && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">Password must contain:</p>
              {validationRules.map((rule, index) => {
                const passed = rule.test(newPassword);
                return (
                  <div key={index} className="flex items-center gap-2">
                    {passed ? (
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${passed ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {confirmPassword && !passwordsMatch && (
            <div className="flex items-center gap-2 text-red-600">
              <X className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Passwords do not match</span>
            </div>
          )}

          {confirmPassword && passwordsMatch && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Passwords match</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all transform ${
              canSubmit
                ? 'bg-purple-600 hover:bg-purple-700 active:scale-[0.98] cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {showSuccess ? 'Password Changed!' : 'Change my password'}
          </button>
          

        </form>

        {showSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center font-medium">
              Your password has been successfully changed!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Forgot;
