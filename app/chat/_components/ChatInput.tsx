/*
 * Copyright 2026 UCP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6">
      <path
        fillRule="evenodd"
        d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5">
      <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
  );
}

function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="bg-white p-4 flex-shrink-0">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto relative flex items-end gap-2 bg-gray-100 rounded-[2rem] p-2 pr-2 shadow-sm transition-colors hover:bg-gray-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">

        {/* Plus Button (Placeholder for attachments) */}
        <button
          type="button"
          className="p-3 text-gray-500 hover:bg-gray-300 rounded-full transition-colors focus:outline-none"
          aria-label="Add attachment"
        >
          <PlusIcon className="w-5 h-5" />
        </button>

        {/* Input Field */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow bg-transparent border-none text-gray-800 placeholder-gray-500 focus:ring-0 focus:outline-none py-3 max-h-32 overflow-y-auto resize-none"
          disabled={isLoading}
          autoComplete="off"
        />

        {/* Send Button */}
        {inputValue.trim() && (
          <button
            type="submit"
            disabled={isLoading}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 focus:outline-none shadow-md"
            aria-label="Send message">
            <SendIcon />
          </button>
        )}
      </form>
      <div className="text-center text-xs text-gray-400 mt-2">
        Gemini may display inaccurate info, including about people, so double-check its responses.
      </div>
    </div>
  );
}

export default ChatInput;
