import React, { useState, useEffect, useRef } from 'react';
import { sendMessage } from '@/api/message.api';
import { getSocket } from '@/components/ui/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile, Image, Video, Mic, Info } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

const MessageInput = ({ chatId }) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const typingTimeoutRef = useRef(null);
  const socket = getSocket();
  const { error: showError, success: showSuccess, info: showInfo } = useToast();

  // File validation constants (matching backend multer config)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_FILES = 5;
  const ALLOWED_TYPES = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'video/mp4', 
    'video/avi',
    'video/mov',
    'video/wmv',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp3',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  // Reset state when chatId changes
  useEffect(() => {
    setText('');
    setSelectedFiles([]);
    setIsTyping(false);
    setIsSending(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [chatId]);

  // Handle typing indicator
  useEffect(() => {
    if (text.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing', { chatId });
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('stopTyping', { chatId });
      }, 2000);
    } else {
      if (isTyping) {
        setIsTyping(false);
        socket.emit('stopTyping', { chatId });
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, chatId, socket, isTyping]);

  const handleSendMessage = async () => {
    if ((!text.trim() && selectedFiles.length === 0) || isSending) return;

    setIsSending(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('chatId', chatId);
      
      if (text.trim()) {
        formData.append('textMessage', text.trim());
      }
      
      // Add files to FormData
      selectedFiles.forEach((file) => {
        formData.append('media', file);
      });

      await sendMessage(chatId, text.trim(), selectedFiles);
      setText('');
      setSelectedFiles([]);
      
      // Stop typing indicator
      setIsTyping(false);
      socket.emit('stopTyping', { chatId });
      
      // Show success message
      if (selectedFiles.length > 0) {
        showSuccess(`Message sent successfully with ${selectedFiles.length} file(s)`);
      } else {
        showSuccess('Message sent successfully');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Handle specific error messages
      if (error.message) {
        if (error.message.includes('Invalid file type')) {
          showError('One or more files have an invalid type. Please check the file types and try again.');
        } else if (error.message.includes('file size')) {
          showError('One or more files are too large. Maximum file size is 10MB.');
        } else if (error.message.includes('Content is required')) {
          showError('Please enter a message or select files to send.');
        } else {
          showError(error.message || 'Failed to send message. Please try again.');
        }
      } else {
        showError('Failed to send message. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File "${file.name}" is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type "${file.type}" is not allowed. Supported types: Images (JPEG, PNG, GIF, WebP), Videos (MP4, AVI, MOV, WMV), Audio (MP3, WAV, OGG, M4A), Documents (PDF, DOC, DOCX, TXT)`
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (event, type) => {
    const files = Array.from(event.target.files);
    
    // Check if adding these files would exceed the limit
    if (selectedFiles.length + files.length > MAX_FILES) {
      showError(`You can only select up to ${MAX_FILES} files at once. You currently have ${selectedFiles.length} files selected.`);
      event.target.value = '';
      return;
    }

    // Validate each file
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(validation.error);
      }
    });

    // Show errors for invalid files
    if (errors.length > 0) {
      errors.forEach(error => showError(error));
    }

    // Add valid files
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      showSuccess(`Added ${validFiles.length} file(s) successfully`);
    }

    event.target.value = ''; // Reset input
  };

  const removeFile = (index) => {
    const fileToRemove = selectedFiles[index];
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    showSuccess(`Removed "${fileToRemove.name}"`);
  };

  const showFileTypeInfo = () => {
    showInfo(`
      📁 Supported File Types:
      
      🖼️ Images: JPEG, PNG, GIF, WebP
      🎥 Videos: MP4, AVI, MOV, WMV
      🎵 Audio: MP3, WAV, OGG, M4A
      📄 Documents: PDF, DOC, DOCX, TXT
      
      📏 Max file size: 10MB per file
      📦 Max files: 5 files per message
    `);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t bg-white p-4">
      {/* File info and selected files preview */}
      <div className="mb-3">
        {/* File info */}
        <div className="text-xs text-gray-500 mb-2">
          <span>Max {MAX_FILES} files, {MAX_FILE_SIZE / (1024 * 1024)}MB each. </span>
          <span>Supported: Images, Videos, Audio, Documents</span>
        </div>
        
        {/* Selected files preview */}
        {selectedFiles.length > 0 && (
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white p-2 rounded border">
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Image upload */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e, 'image')}
          className="hidden"
          id={`image-input-${chatId}`}
        />
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-gray-500 hover:text-gray-700"
          onClick={() => document.getElementById(`image-input-${chatId}`)?.click()}
        >
          <Image className="h-5 w-5" />
        </Button>

        {/* Video upload */}
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => handleFileSelect(e, 'video')}
          className="hidden"
          id={`video-input-${chatId}`}
        />
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-gray-500 hover:text-gray-700"
          onClick={() => document.getElementById(`video-input-${chatId}`)?.click()}
        >
          <Video className="h-5 w-5" />
        </Button>

        {/* Audio upload */}
        <input
          type="file"
          accept="audio/*"
          multiple
          onChange={(e) => handleFileSelect(e, 'audio')}
          className="hidden"
          id={`audio-input-${chatId}`}
        />
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-gray-500 hover:text-gray-700"
          onClick={() => document.getElementById(`audio-input-${chatId}`)?.click()}
        >
          <Mic className="h-5 w-5" />
        </Button>

        {/* General file upload */}
        <input
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e, 'file')}
          className="hidden"
          id={`file-input-${chatId}`}
        />
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-gray-500 hover:text-gray-700"
          onClick={() => document.getElementById(`file-input-${chatId}`)?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Info button */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-gray-500 hover:text-gray-700"
          onClick={showFileTypeInfo}
          title="File upload information"
        >
          <Info className="h-5 w-5" />
        </Button>

        {/* Emoji button */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-gray-500 hover:text-gray-700"
          onClick={() => console.log('Emoji picker coming soon')}
        >
          <Smile className="h-5 w-5" />
        </Button>

        {/* Text input */}
        <div className="flex-1">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
            disabled={isSending}
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSendMessage}
          disabled={(text.trim() === '' && selectedFiles.length === 0) || isSending}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed send-button"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
