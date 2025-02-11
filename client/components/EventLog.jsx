import { ArrowUp, ArrowDown } from "react-feather";
import { useState } from "react";

function Event({ event, timestamp }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isClient = event.event_id && !event.event_id.startsWith("event_");

  return (
    <div className="terminal-line">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isClient ? (
          <ArrowDown className="text-[#4af626] opacity-50" />
        ) : (
          <ArrowUp className="text-[#4af626] opacity-50" />
        )}
        <div className="text-sm imperial-text glow">
          {isClient ? "client" : "server"}: {event.type} | {timestamp}
        </div>
      </div>
      {isExpanded && (
        <div className="mt-2 text-[#4af626] opacity-80 bg-[#0d1117] p-2 rounded-none overflow-x-auto">
          <pre className="text-xs">{JSON.stringify(event, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default function EventLog({ events }) {
  const eventsToDisplay = [];
  let deltaEvents = {};

  events.forEach((event) => {
    if (event.type.endsWith("delta")) {
      if (deltaEvents[event.type]) {
        return;
      } else {
        deltaEvents[event.type] = event;
      }
    }

    eventsToDisplay.push(
      <Event
        key={event.event_id}
        event={event}
        timestamp={new Date().toLocaleTimeString()}
      />,
    );
  });

  return (
    <div className="flex flex-col gap-0">
      {events.length === 0 ? (
        <div className="terminal-line">
          <div className="imperial-text glow opacity-50">awaiting transmission...</div>
        </div>
      ) : (
        eventsToDisplay
      )}
    </div>
  );
}
