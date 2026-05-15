(() => {
  const params = new URLSearchParams(window.location.search);
  const prompt = params.get("q")?.trim() || "";

  if (params.get("aisearch_submit") !== "1" || !prompt) {
    return;
  }

  const startedAt = Date.now();
  const timeoutMs = 20000;

  const host = (() => {
    if (location.hostname.endsWith("chatgpt.com")) return "chatgpt";
    if (location.hostname.endsWith("claude.ai")) return "claude";
    return "";
  })();

  if (!host) {
    return;
  }

  const editorSelectors = {
    chatgpt: [
      "#prompt-textarea",
      '[data-testid="prompt-textarea"]',
      'div[contenteditable="true"]',
      "textarea",
    ],
    claude: [
      'div[contenteditable="true"]',
      'textarea[placeholder*="Claude" i]',
      'textarea[aria-label*="message" i]',
      "textarea",
    ],
  };

  const sendSelectors = {
    chatgpt: [
      '[data-testid="send-button"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label="Send message"]',
      'button[type="submit"]',
    ],
    claude: [
      'button[aria-label="Send message"]',
      'button[aria-label="Send Message"]',
      'button[data-testid="send-button"]',
      'button[type="submit"]',
    ],
  };

  const isVisible = (element) => {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  };

  const findComposer = () => {
    for (const selector of editorSelectors[host]) {
      for (const element of document.querySelectorAll(selector)) {
        if (isVisible(element)) {
          return element;
        }
      }
    }

    return null;
  };

  const setNativeValue = (element, value) => {
    const prototype = Object.getPrototypeOf(element);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

    if (descriptor?.set) {
      descriptor.set.call(element, value);
    } else {
      element.value = value;
    }
  };

  const fillComposer = (composer) => {
    const existingText = (composer.value || composer.textContent || "").trim();

    if (existingText === prompt) {
      return true;
    }

    composer.focus();

    composer.dispatchEvent(new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      data: prompt,
      inputType: "insertText",
    }));

    if (composer.tagName === "TEXTAREA" || composer.tagName === "INPUT") {
      setNativeValue(composer, prompt);
    } else {
      composer.textContent = prompt;
    }

    composer.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      data: prompt,
      inputType: "insertText",
    }));
    composer.dispatchEvent(new Event("change", { bubbles: true }));

    return (composer.value || composer.textContent || "").trim().length > 0;
  };

  const findSendButton = () => {
    for (const selector of sendSelectors[host]) {
      for (const button of document.querySelectorAll(selector)) {
        const isEnabled = !button.disabled && button.getAttribute("aria-disabled") !== "true";

        if (isVisible(button) && isEnabled) {
          return button;
        }
      }
    }

    return null;
  };

  const cleanUrl = () => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("aisearch_submit");
    window.history.replaceState({}, "", nextUrl);
  };

  const trySubmit = () => {
    if (Date.now() - startedAt > timeoutMs) {
      return true;
    }

    const composer = findComposer();

    if (!composer || !fillComposer(composer)) {
      return false;
    }

    const button = findSendButton();

    if (!button) {
      return false;
    }

    button.click();
    cleanUrl();
    return true;
  };

  if (trySubmit()) {
    return;
  }

  const observer = new MutationObserver(() => {
    if (trySubmit()) {
      observer.disconnect();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["disabled", "aria-disabled", "data-state", "class"],
  });

  window.setTimeout(() => observer.disconnect(), timeoutMs);
})();
