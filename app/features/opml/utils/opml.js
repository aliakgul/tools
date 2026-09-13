export function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateFeed(feed) {
  return {
    title: Boolean(feed.title.trim()),
    xmlUrl: isHttpUrl(feed.xmlUrl.trim()),
    htmlUrl: !feed.htmlUrl.trim() || isHttpUrl(feed.htmlUrl.trim()),
  };
}

export function normalizeFeedUrl(value) {
  try {
    const url = new URL(value.trim());
    url.hash = "";
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.href;
  } catch {
    return value.trim();
  }
}

export function deduplicateFeeds(feeds) {
  const seen = new Set();

  return feeds.filter((feed) => {
    const identity = normalizeFeedUrl(feed.xmlUrl);
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

function createFeedOutline(xmlDocument, feed) {
  const outline = xmlDocument.createElement("outline");
  outline.setAttribute("text", feed.title.trim());
  outline.setAttribute("title", feed.title.trim());
  outline.setAttribute("type", "rss");
  outline.setAttribute("xmlUrl", feed.xmlUrl.trim());

  if (feed.htmlUrl.trim()) {
    outline.setAttribute("htmlUrl", feed.htmlUrl.trim());
  }

  return outline;
}

export function buildOpmlDocument({ title, feeds, createdAt = new Date() }) {
  const xmlDocument = document.implementation.createDocument(null, "opml");
  const opml = xmlDocument.documentElement;
  opml.setAttribute("version", "2.0");

  const head = xmlDocument.createElement("head");
  const titleElement = xmlDocument.createElement("title");
  titleElement.textContent = title.trim();
  const dateCreated = xmlDocument.createElement("dateCreated");
  dateCreated.textContent = createdAt.toUTCString();
  head.append(titleElement, dateCreated);

  const body = xmlDocument.createElement("body");
  const categories = new Map();

  feeds.forEach((feed) => {
    const category = feed.category.trim();
    const feedOutline = createFeedOutline(xmlDocument, feed);

    if (!category) {
      body.append(feedOutline);
      return;
    }

    if (!categories.has(category)) {
      const categoryOutline = xmlDocument.createElement("outline");
      categoryOutline.setAttribute("text", category);
      categoryOutline.setAttribute("title", category);
      categories.set(category, categoryOutline);
      body.append(categoryOutline);
    }

    categories.get(category).append(feedOutline);
  });

  opml.append(head, body);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(xmlDocument)}`;
}

export function parseOpmlDocument(source) {
  const xmlDocument = new DOMParser().parseFromString(source, "application/xml");
  if (xmlDocument.querySelector("parsererror")) {
    throw new Error("invalid-xml");
  }

  const opml = xmlDocument.documentElement;
  const body = Array.from(opml.children).find((element) => element.localName === "body");
  if (opml.localName !== "opml" || !body) {
    throw new Error("invalid-opml");
  }

  const head = Array.from(opml.children).find((element) => element.localName === "head");
  const titleElement = head
    ? Array.from(head.children).find((element) => element.localName === "title")
    : null;
  const feeds = [];

  function readOutlines(parent, categories = []) {
    Array.from(parent.children)
      .filter((element) => element.localName === "outline")
      .forEach((outline) => {
        const xmlUrl = outline.getAttribute("xmlUrl") || "";
        const outlineTitle = outline.getAttribute("title") || outline.getAttribute("text") || "";

        if (xmlUrl) {
          feeds.push({
            title: outlineTitle,
            xmlUrl,
            htmlUrl: outline.getAttribute("htmlUrl") || "",
            category: categories.join(" / "),
          });
          return;
        }

        const nextCategories = outlineTitle ? [...categories, outlineTitle] : categories;
        readOutlines(outline, nextCategories);
      });
  }

  readOutlines(body);
  if (!feeds.length) {
    throw new Error("no-feeds");
  }

  return {
    title: titleElement?.textContent?.trim() || "",
    feeds,
  };
}
