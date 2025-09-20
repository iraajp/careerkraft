import React, { useState } from 'react';
import { Roadmap } from '../types';
import { PhoneCallIcon, UserIcon } from './icons';
import Spinner from './Spinner';

interface PhoneNumberInputProps {
  roadmap: Roadmap;
  onCallSubmit: (phoneNumber: string) => Promise<boolean>;
  onBack: () => void;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ roadmap, onCallSubmit, onBack }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation: check if it's not empty and has a reasonable length
    if (phoneNumber.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid phone number including area code.');
      return;
    }
    setIsLoading(true);
    const success = await onCallSubmit(phoneNumber);
    if (!success) {
      setIsLoading(false);
    }
    // On success, the parent component will handle the state transition
  };

  return (
    <div className="w-full max-w-lg p-8 bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700 animate-fade-in text-center">
      <div className="w-20 h-20 rounded-full bg-purple-500/20 mx-auto mb-4 flex items-center justify-center border-2 border-purple-400 shadow-lg">
        <UserIcon className="w-12 h-12 text-purple-300" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-1">Meet Your AI Mentor</h1>
      <p className="text-md text-purple-300 mb-6">For {roadmap.title}</p>

      <p className="text-gray-300 mb-6">
        Enter your phone number below to receive a call from your personalized AI mentor.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="phone-number" className="sr-only">
            Phone Number
          </label>
          <input
            id="phone-number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g., +1 (555) 123-4567"
            required
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-600 rounded-lg text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          />
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onBack}
              className="w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-full hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-800 transition-all duration-300"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <PhoneCallIcon className="w-5 h-5" />
              Call Me
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PhoneNumberInput;
