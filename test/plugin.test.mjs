import assert from "node:assert/strict";
import test from "node:test";

import plugin, { server } from "../dist/index.js";
import { STRICT_MODE_RULE } from "../dist/strict-rule.js";

const createTextPart = (text) => ({
  type: "text",
  text,
});

const createMessage = (role, text, id = `${role}-${Math.random().toString(36).slice(2)}`) => ({
  info: {
    id,
    role,
  },
  parts: [createTextPart(text)],
});

const createOutput = (messages) => ({
  messages: structuredClone(messages),
});

const runTransform = async (messages) => {
  const hooks = await server();
  const transform = hooks["experimental.chat.messages.transform"];

  assert.equal(typeof transform, "function", "transform hook should exist");

  const output = createOutput(messages);
  await transform({}, output);
  return output.messages;
};

const getSystemRuleMessages = (messages) =>
  messages.filter(
    (message) =>
      message.info?.role === "system" &&
      message.parts?.some((part) => part.type === "text" && part.text === STRICT_MODE_RULE),
  );

test("plugin exports expected id", () => {
  assert.equal(plugin.id, "strict-mode");
  assert.equal(plugin.server, server);
});

test("injects strict rule by default", async () => {
  const messages = await runTransform([
    createMessage("user", "Explain why this React component re-renders"),
  ]);

  assert.equal(messages[0].info.role, "system");
  assert.equal(messages[0].parts[0].text, STRICT_MODE_RULE);
  assert.equal(getSystemRuleMessages(messages).length, 1);
});

test("does not duplicate strict rule when already present", async () => {
  const existingRule = {
    info: {
      id: "strict-mode-global-rule",
      role: "system",
    },
    parts: [createTextPart(STRICT_MODE_RULE)],
  };

  const messages = await runTransform([
    existingRule,
    createMessage("user", "Explain memoization"),
  ]);

  assert.equal(getSystemRuleMessages(messages).length, 1);
  assert.equal(messages[0].parts[0].text, STRICT_MODE_RULE);
});

test("disables strict mode for session when user sends /strict off", async () => {
  const messages = await runTransform([
    createMessage("user", "/strict off"),
    createMessage("user", "Explain memoization"),
  ]);

  assert.equal(getSystemRuleMessages(messages).length, 0);
});

test("re-enables strict mode after /strict on", async () => {
  const messages = await runTransform([
    createMessage("user", "/strict off"),
    createMessage("user", "/strict on"),
    createMessage("user", "Explain memoization"),
  ]);

  assert.equal(getSystemRuleMessages(messages).length, 1);
  assert.equal(messages[0].parts[0].text, STRICT_MODE_RULE);
});

test("supports natural language toggles", async () => {
  const offMessages = await runTransform([
    createMessage("user", "normal mode"),
    createMessage("user", "Explain memoization"),
  ]);

  assert.equal(getSystemRuleMessages(offMessages).length, 0);

  const onMessages = await runTransform([
    createMessage("user", "normal mode"),
    createMessage("user", "be strict"),
    createMessage("user", "Explain memoization"),
  ]);

  assert.equal(getSystemRuleMessages(onMessages).length, 1);
});

test("accepts line-based commands inside a multi-line message", async () => {
  const messages = await runTransform([
    createMessage("user", "Keep helping with this task.\n/strict off\nContinue."),
    createMessage("user", "Explain memoization"),
  ]);

  assert.equal(getSystemRuleMessages(messages).length, 0);
});

test("does not toggle strict mode for incidental discussion text", async () => {
  const messages = await runTransform([
    createMessage("user", "Can you explain what normal mode means in this plugin?"),
    createMessage("user", "Explain memoization"),
  ]);

  assert.equal(getSystemRuleMessages(messages).length, 1);
});

test("removes previously injected strict rule when later history disables strict mode", async () => {
  const messages = await runTransform([
    {
      info: {
        id: "strict-mode-global-rule",
        role: "system",
      },
      parts: [createTextPart(STRICT_MODE_RULE)],
    },
    createMessage("user", "/strict off"),
    createMessage("user", "Explain memoization"),
  ]);

  assert.equal(getSystemRuleMessages(messages).length, 0);
});
