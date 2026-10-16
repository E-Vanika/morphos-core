# Monika Glam Up content guide

This guide covers the common updates that can be made without changing the site layout.

## Change the visible photos

All permanent site photos are in `apps/web/public/gallery/`. The simplest and safest method is to replace an existing file with a new image that has **the exact same filename and extension**. No code change is then required.

| Where the photo appears | File to replace |
|---|---|
| Large home-page hero photo | `bridal-bridesmaid-makeup.jpeg` |
| Small overlapping hero photo | `bridal-hairstyle.jpeg` |
| Beyond the Bridal Look photo | `bridal-reception-hairstyle.jpeg` |
| Selected Work: makeup | `bridal-bridesmaid-makeup.jpeg` |
| Selected Work: hairstyle | `bridal-hairstyle.jpeg` |
| Selected Work: saree draping | `bridal-saree-draping.jpeg` |
| Selected Work: reception hair | `bridal-reception-hairstyle.jpeg` |

The two photos shown in the screenshot are therefore:

- Main photo: `apps/web/public/gallery/bridal-bridesmaid-makeup.jpeg`
- Small overlay: `apps/web/public/gallery/bridal-hairstyle.jpeg`

Use a clear portrait-oriented JPG/JPEG, ideally at least 1200 pixels tall. Keep the subject near the centre because the responsive layout crops the edges with `object-fit: cover`.

To use a different filename instead, upload the image to the gallery folder and change its `/gallery/...` reference in `apps/web/app/page.tsx`. Update the nearby `alt` text so it accurately describes the new photo.

After pushing the change, wait for Vercel to redeploy. Browser image and favicon caches can be persistent, so use a hard refresh (`Ctrl+F5`) or a private window when checking the result.

## Change Monika Glam Up prices

All shared Monika Glam Up prices have one source of truth:

`apps/web/lib/site-content.ts`

Edit only the value on the right side of the required entry. Keep the quotation marks and currency formatting. Example:

```ts
export const MONIKA_PRICES = {
  matte: "₹8,500",
  softGlam: "₹9,500",
  // ...
} as const;
```

These values automatically update the visible service cards, enquiry choices, AI fallback answers, RAG knowledge and MCP service menu. Search the file for the existing amount or service key if unsure.

The keys mean:

| Key | Service |
|---|---|
| `matte` | Matte Finish Bridal Look |
| `softGlam` | Soft Glam Bridal Look |
| `skinFinish` | Skin Finish Bridal Look |
| `glow` | Glow Finish Bridal Look |
| `bridesmaid` | Bridesmaid Package |
| `bridesmaidHair` | Bridesmaid Hairstyling quoted by the concierge |
| `party` | Party Makeup Package |
| `bridalHair` | Bridal Hairstyling |
| `sareeDraping` | Saree Draping |
| `prePleating` | Saree pre-pleating starting price |

Mamo Self Care has a separate menu. Its service and combo prices are in `apps/web/app/mamo-self-care/page.tsx`; changing those does not change Monika's bridal prices.

## Change text, links or branding

- Home-page headings, service names/descriptions and photo references: `apps/web/app/page.tsx`
- Instagram link: the `NEXT_PUBLIC_INSTAGRAM_URL` Vercel environment variable
- Monika logo and favicon: `apps/web/public/monika-glamup-icon.svg`
- Colours and layout: `apps/web/app/globals.css`

Do not put secrets, Telegram tokens, Gemini keys or Google Sheets webhook URLs into these files.

## Publish and verify

1. Commit and push the changed files to `main`.
2. Wait for the GitHub deployment workflow and Vercel deployment to pass.
3. Open the Monika site and verify the desktop and mobile layouts.
4. Ask the concierge for the changed service price and confirm it matches the service card.
5. If an old image remains, hard-refresh or test in a private window.
