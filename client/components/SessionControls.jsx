import { useState } from "react";
import { CloudLightning, CloudOff, MessageSquare } from "react-feather";
import Button from "./Button";

function SessionStopped({ startSession }) {
  const [isActivating, setIsActivating] = useState(false);

  function handleStartSession() {
    if (isActivating) return;
    setIsActivating(true);
    startSession();
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Button
        onClick={handleStartSession}
        className={isActivating ? "bg-[#1a1f25]" : "bg-[#1a1f25] hover:bg-[#2a3543]"}
        icon={<CloudLightning height={16} className="text-[#4af626] opacity-50" />}
      >
        {isActivating ? "connecting..." : "connect"}
      </Button>
    </div>
  );
}

function SessionActive({ stopSession, sendTextMessage }) {
  const [message, setMessage] = useState("");

  function handleSendClientEvent() {
    sendTextMessage(message);
    setMessage("");
  }

  return (
    <div className="flex items-center justify-center w-full h-full gap-4">
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter" && message.trim()) {
            handleSendClientEvent();
          }
        }}
        type="text"
        placeholder="send a text message..."
        className="flex-1 bg-[#0d1117] text-[#4af626] border border-[#4af626] border-opacity-20 p-4 rounded-none font-sans text-base tracking-wider placeholder:text-[#4af626] placeholder:opacity-30 focus:outline-none focus:border-opacity-50"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        onClick={() => {
          if (message.trim()) {
            handleSendClientEvent();
          }
        }}
        icon={<MessageSquare height={18} className="text-[#4af626] opacity-50" />}
        className="bg-[#1a1f25] hover:bg-[#2a3543]"
      >
        send text
      </Button>
      <Button 
        onClick={stopSession} 
        icon={<CloudOff height={18} className="text-[#4af626] opacity-50" />}
        className="bg-[#1a1f25] hover:bg-[#2a3543]"
      >
        disconnect
      </Button>
    </div>
  );
}

export default function SessionControls({
  startSession,
  stopSession,
  sendClientEvent,
  sendTextMessage,
  serverEvents,
  isSessionActive,
}) {
  return (
    <div className="flex gap-4 h-full">
      {isSessionActive ? (
        <SessionActive
          stopSession={stopSession}
          sendClientEvent={sendClientEvent}
          sendTextMessage={sendTextMessage}
          serverEvents={serverEvents}
        />
      ) : (
        <SessionStopped startSession={startSession} />
      )}
    </div>
  );
}
