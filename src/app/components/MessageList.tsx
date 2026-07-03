import type { UIMessage } from "ai";
import { EmptyState } from "./EmptyState";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

type Props = {
  messages: UIMessage[];
  busy: boolean;
  userLabel: string; // e.g. `You (Acme - admin)`
  assistantLabel?: string; // defaults to "BW-Recruiter"
};

export function MessageList({ messages, busy, userLabel, assistantLabel = "BW-Recruiter" }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
      {messages.length === 0 && <EmptyState />}

      {messages.map((message, index) => {
        const isSameSenderAsPrevious = index > 0 && messages[index - 1].role === message.role;
        return (
          <MessageBubble
            key={message.id}
            message={message}
            isSameSenderAsPrevious={isSameSenderAsPrevious}
            senderLabel={message.role === "user" ? userLabel : assistantLabel}
          />
        );
      })}

      {busy && <TypingIndicator />}
    </div>
  );
}