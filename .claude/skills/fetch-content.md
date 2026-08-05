# fetch-content

Fetch a URL as clean markdown. Used by `archive-source` when the user gives a link to a webpage (e.g. an online nutrition label, recipe, or food/diet plan) instead of a local image or PDF — the `Read` tool can't fetch remote URLs, so this gets the page content first.

## Usage

```
/fetch-content <url>
```
Also triggers implicitly whenever the user shares a URL they want archived or logged from, or `archive-source` needs page content for a web-based source.

## Steps

### 1. Respect the rate limit

`sleep 2` before the first request.

### 2. Fallback chain

Try each option in order, moving to the next only if the current one fails (empty output, an error page, a non-2xx response, or a curl error):

1. **defuddle** — strip `https://` from the URL and prepend `https://defuddle.md/`:
   ```bash
   curl -s "https://defuddle.md/example.com/post"
   ```
2. **Jina Reader** — prepend `https://r.jina.ai/` to the full original URL (including `https://`):
   ```bash
   curl -s "https://r.jina.ai/https://example.com/post"
   ```
3. **WebFetch tool** — if both curl-based options fail, fall back to WebFetch.

### 3. Hand off

Treat the resulting markdown as the source content and continue with whatever triggered the fetch (typically `archive-source`'s transcription steps). If all three options fail, say so rather than fabricating content.
