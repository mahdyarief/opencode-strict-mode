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
const isStrictRuleMessage = (message) => message.parts.some((part) => part.type === "text" &&
    typeof part.text === "string" &&
    part.text.includes(RULE_MARKER));
const createStrictRuleMessage = () => ({
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
const getMessageRole = (message) => typeof message.info.role === "string" ? message.info.role : undefined;
const getMessageText = (message) => message.parts
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text ?? "")
    .join("\n");
const getLastMatchIndex = (text, patterns) => {
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
const getStrictModeEnabled = (messages) => {
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
export const server = async () => {
    return {
        "experimental.chat.messages.transform": async (_input, output) => {
            const transformOutput = output;
            if (!Array.isArray(transformOutput.messages)) {
                return;
            }
            const messagesWithoutStrictRule = transformOutput.messages.filter((message) => !isStrictRuleMessage(message));
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
