import type { Plugin } from "@opencode-ai/plugin";

import { STRICT_MODE_RULE } from "./strict-rule.js";

const RULE_MARKER = "Strict mode is enabled by default.";

const STRICT_ON_PATTERNS = [
  /\/strict\s+on\b/gi,
  /\bbe\s+strict\b/gi,
  /\bstrict\s+mode\b/gi,
];

const STRICT_OFF_PATTERNS = [
  /\/strict\s+off\b/gi,
  /\bstop\s+strict\b/gi,
  /\bnormal\s+mode\b/gi,
];

type MessagePart = {
  type?: string;
  text?: string;
};

type TransformMessage = {
  info: Record<string, unknown>;
  parts: MessagePart[];
};

type TransformOutput = {
  messages: TransformMessage[];
};

const isStrictRuleMessage = (message: TransformMessage) =>
  message.parts.some(
    (part) =>
      part.type === "text" &&
      typeof part.text === "string" &&
      part.text.includes(RULE_MARKER),
  );

const createStrictRuleMessage = (): TransformMessage => ({
  info: {
    id: "strict-mode-global-rule",
    role: "system",
  },
  parts: [
    {
      type: "text",
      text: STRICT_MODE_RULE,
    },
  ],
});

const getMessageRole = (message: TransformMessage) =>
  typeof message.info.role === "string" ? message.info.role : undefined;

const getMessageText = (message: TransformMessage) =>
  message.parts
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text ?? "")
    .join("\n");

const getLastMatchIndex = (text: string, patterns: RegExp[]) => {
  let lastIndex = -1;

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      if (typeof match.index === "number" && match.index > lastIndex) {
        lastIndex = match.index;
      }
    }
  }

  return lastIndex;
};

const getStrictModeEnabled = (messages: TransformMessage[]) => {
  let enabled = true;

  for (const message of messages) {
    if (getMessageRole(message) !== "user") {
      continue;
    }

    const text = getMessageText(message);

    if (!text) {
      continue;
    }

    const lastOnIndex = getLastMatchIndex(text, STRICT_ON_PATTERNS);
    const lastOffIndex = getLastMatchIndex(text, STRICT_OFF_PATTERNS);

    if (lastOnIndex === -1 && lastOffIndex === -1) {
      continue;
    }

    enabled = lastOnIndex > lastOffIndex;
  }

  return enabled;
};

export const server: Plugin = async () => {
  return {
    "experimental.chat.messages.transform": async (_input, output) => {
      const transformOutput = output as TransformOutput;

      if (!Array.isArray(transformOutput.messages)) {
        return;
      }

      const messagesWithoutStrictRule = transformOutput.messages.filter(
        (message) => !isStrictRuleMessage(message),
      );

      const strictModeEnabled = getStrictModeEnabled(messagesWithoutStrictRule);

      transformOutput.messages = strictModeEnabled
        ? [createStrictRuleMessage(), ...messagesWithoutStrictRule]
        : messagesWithoutStrictRule;
    },
  };
};

export default {
  id: "strict-mode",
  server,
};
