import { isToolUIPart, type UIMessage } from "ai";
import { UserIcon, BotIcon } from "./Icons";
import { ToolCall } from "./ToolCall";

type Props = {
  message: UIMessage;
  isSameSenderAsPrevious: boolean;
  senderLabel: string;
};

export function MessageBubble({ message, isSameSenderAsPrevious, senderLabel }: Props) {
  const isUser = message.role === "user";
  const textParts = message.parts.filter((p) => p.type === "text");
  const toolParts = message.parts.filter(isToolUIPart);

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} ${isSameSenderAsPrevious ? "mt-2" : "mt-6"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div className={`flex w-full max-w-full sm:max-w-[85%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isSameSenderAsPrevious ? (
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${isUser ? "bg-zinc-100 border-zinc-200 text-zinc-600" : "bg-blue-600 border-blue-700 text-white shadow-sm"
              }`}
          >
            {isUser ? <UserIcon /> : <BotIcon />}
          </div>
        ) : (
          <div className="w-8 shrink-0" />
        )}

        <div className={`flex flex-col gap-1 w-full ${isUser ? "items-end" : "items-start"}`}>
          {!isSameSenderAsPrevious && (
            <span className="text-[13px] font-medium text-zinc-500 mb-1 px-1">{senderLabel}</span>
          )}

          {textParts.map((part, i) => (
            <div
              key={`text-${i}`}
              className={`px-4 py-3 text-[15px] leading-relaxed shadow-sm ${isUser ? "bg-zinc-900 text-white rounded-2xl rounded-tr-sm" : "bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-sm"
                }`}
            >
              <p className="whitespace-pre-wrap">{part.text}</p>
            </div>
          ))}

          {toolParts.map((part, i) => {
            const isSilent = part.input && typeof part.input === "object" && "silent" in part.input && (part.input as any).silent === true;
            if (isSilent) return null;
            return (
              <div key={`tool-${i}`} className={`mt-1 w-full ${!isUser && "sm:max-w-[440px]"}`}>
                <ToolCall part={part} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}