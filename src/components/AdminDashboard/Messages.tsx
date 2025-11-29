import React, { useState, useEffect } from 'react';
import{Eye, Trash2 } from "lucide-react";
import emptyIllustration from "../assets/message.png";
import './Messages.css';

type Message = {
  id: number;
  sender?: string;
  recipient?: string;
  subject: string;
  time: string;
  body?: string;
};

const fetchMessages = (tab: string): Promise<Message[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]); // Always return empty initially
    }, 1200);
  });
};

export const Messages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Inbox' | 'Sent'>('Inbox');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showNewMessage, setShowNewMessage] = useState<boolean>(false);

  const [fromDate, setFromDate] = useState<string>('');
  const [untilDate, setUntilDate] = useState<string>('');
  const [attachmentOption, setAttachmentOption] = useState<string>('All');

  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadMessages(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const loadMessages = async (tab: 'Inbox' | 'Sent') => {
  setLoading(true);
  setError(null);
  try {
    const data = await fetchMessages(tab);

    if (tab === 'Inbox') {
      setInboxMessages(prev => prev.length > 0 ? prev : data);
    } else {
      setSentMessages(prev => prev.length > 0 ? prev : data);
    }
  } catch {
    setError('Failed to load messages.');
    if (tab === 'Inbox') setInboxMessages([]);
    else setSentMessages([]);
  } finally {
    setLoading(false);
  }
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSend = () => {
    if (!subject.trim()) {
      alert('Subject is required.');
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      recipient,
      subject,
      time: new Date().toLocaleString(),
      body: messageBody || "(No message body)"
    };

    setSentMessages([newMessage, ...sentMessages]);
    setShowNewMessage(false);

    setRecipient('');
    setSubject('');
    setMessageBody('');
    setFile(null);

    setActiveTab('Sent');
    setToast("Message sent successfully");
  };

  const renderMessages = () => {
    if (loading) return <p>Loading messages...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    const currentMessages = activeTab === 'Inbox' ? inboxMessages : sentMessages;

    if (currentMessages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-5 bg-white">
          <img
            src={emptyIllustration}
            alt="No messages"
            className="w-80 mb-4"
          />
          <p className="text-gray-600">
            You have no messages in your {activeTab.toLowerCase()}
          </p>
        </div>
      );
    }

    return (
      <ul className="message-list mt-6 space-y-4">
        {currentMessages.map((msg) => (
          <li
            key={msg.id}
            className="bg-gray cursor-pointer hover:bg-gray-50 relative group"
            onClick={() => setSelectedMessage(msg)}
          >
            <strong>{msg.sender || msg.recipient || 'Unknown'}</strong>
            <div className="text-gray-800">{msg.subject}</div>
            <small className="text-gray-500">{msg.time}</small>

            
           {/* Actions: hidden by default, appear when row is hovered */}

         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 {/*preview*/}
            <div className="relative group/icon inline-flex">     
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedMessage(msg); }}
                className="text-blue-600 hover:text-blue-800"
              >
                <Eye className="h-5 w-5 cursor-pointer text-gray-900 hover:text-blue-700" />
                        
              </button>
              
                        <span
                          className="absolute -top-9 left-1/2 -translate-x-1/2
                                     bg-black text-white text-xs rounded px-2 py-1
                                     opacity-0 group-hover/icon:opacity-100
                                     transition"
                        >
                          Preview
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></span>
                        </span>
             </div>
                      {/* delete*/}
           <div className="relative group/icon inline-flex">
              <button 
                onClick={(e) => { e.stopPropagation(); setMessageToDelete(msg); }}
                className="text-red-600 hover:text-red-800"
              >
                Trash2
              </button>
               <span
                          className="absolute -top-9 left-1/2 -translate-x-1/2
                                     bg-black text-white text-xs rounded px-2 py-1
                                     opacity-0 group-hover/icon:opacity-100
                                     transition"
                        >
                          Delete
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></span>
                        </span>
              </div>
          </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="messages-container p-6 relative bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {/* Tabs */}
      <div className="flex space-x-8 border-b mb-4">
        {(['Inbox', 'Sent'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${activeTab === tab ? 'border-b-4 border-blue-600 font-semibold' : 'text-gray-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top Buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowFilters(true)}
          className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
        >
          Filters
        </button>

        <button
          onClick={() => setShowNewMessage(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New message
        </button>
      </div>

      {/* Message Content */}
      <div>{renderMessages()}</div>

      {/* Filters Drawer */}
      {showFilters && (
        <div className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-lg z-50 border-l px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button onClick={() => setShowFilters(false)} className="text-gray-600 text-2xl">&times;</button>
          </div>

          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Show messages received from</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Show messages received until</label>
              <input type="date" value={untilDate} onChange={(e) => setUntilDate(e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">File attachments</label>
            <select value={attachmentOption} onChange={(e) => setAttachmentOption(e.target.value)} className="w-full border px-3 py-2 rounded">
              <option value="All">All messages, with or without files</option>
              <option value="WithFiles">Only messages with files</option>
              <option value="WithoutFiles">Only messages without files</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button onClick={() => setShowFilters(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">Cancel</button>
            <button onClick={() => setShowFilters(false)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Apply</button>
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-semibold mb-6">New message</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Send to</label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full border rounded px-4 py-2 bg-gray-100"
              >
                <option value="">Select recipient</option>
                <option value="All Users">All Users</option>
                <option value="System Administrator">System Administrator</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Subject <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Give your message a subject line"
                className="w-full border rounded px-4 py-2 bg-gray-100"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                className="w-full border px-4 py-3 rounded resize-none bg-gray-100"
                rows={6}
                placeholder="Type your message here..."
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-6">
              <div className="border border-blue-500 border-dashed rounded-lg p-4 text-center bg-blue-50 cursor-pointer hover:bg-blue-100">
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <p className="text-blue-600 font-medium">📎 Select a file to upload</p>
                  <p className="text-sm text-gray-500">or drag and drop your file here.</p>
                </label>
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                {file && <p className="text-sm mt-2 text-gray-700">Attached: {file.name}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowNewMessage(false)} className="px-4 py-2 border text-gray-600 rounded hover:bg-gray-100">Cancel</button>
              <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
            <h2 className="text-2xl font-semibold mb-4">Message Details</h2>
            <p><strong>From:</strong> {selectedMessage.sender || 'System'}</p>
            <p><strong>To:</strong> {selectedMessage.recipient || 'You'}</p>
            <p><strong>Subject:</strong> {selectedMessage.subject}</p>
            <p><strong>Time:</strong> {selectedMessage.time}</p>
            <div className="mt-4 text-gray-700">
              {selectedMessage.body || '(No message body)'}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>{messageToDelete.subject}</strong>?</p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setMessageToDelete(null)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeTab === "Inbox") {
                    setInboxMessages(inboxMessages.filter(m => m.id !== messageToDelete.id));
                  } else {
                    setSentMessages(sentMessages.filter(m => m.id !== messageToDelete.id));
                  }
                  setToast("Message deleted successfully");
                  setMessageToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};
