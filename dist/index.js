import { STRICT_MODE_RULE } from "./strict-rule.js";
const RULE_MARKER = "Strict mode is enabled by default.";
const STRICT_ON_COMMANDS = new Set(["/strict on", "be strict", "strict mode"]);
const STRICT_OFF_COMMANDS = new Set([
    "/strict off",
    "stop strict",
    "normal mode",
]);
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
const normalizeCommandText = (text) => text
    .trim()
    .toLowerCase()
    .replace(/^[\s"'`([{]+|[\s"'`)\]}!,.?:;]+$/g, "");
const getCommandToggle = (text) => {
    const normalizedFullText = normalizeCommandText(text);
    if (STRICT_ON_COMMANDS.has(normalizedFullText)) {
        return true;
    }
    if (STRICT_OFF_COMMANDS.has(normalizedFullText)) {
        return false;
    }
    const lines = text
        .split(/\r?\n/)
        .map((line) => normalizeCommandText(line))
        .filter(Boolean);
    for (let index = lines.length - 1; index >= 0; index -= 1) {
        const line = lines[index];
        if (STRICT_ON_COMMANDS.has(line)) {
            return true;
        }
        if (STRICT_OFF_COMMANDS.has(line)) {
            return false;
        }
    }
    return undefined;
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
        const toggle = getCommandToggle(text);
        if (typeof toggle === "boolean") {
            enabled = toggle;
        }
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
