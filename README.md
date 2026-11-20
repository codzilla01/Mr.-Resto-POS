This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Local access and WhatsApp sharing

The app starts in cashier mode. Before handing a device to staff, the owner must use **Owner / developer sign in** and set a password of at least eight characters. The owner and developer roles currently share this device-local password. Signing out returns to cashier mode; reloading also returns to cashier mode. Inventory, reports, licensing, developer tools and WhatsApp sharing are hidden and guarded in the interface.

**Security limitation:** This is an offline, browser-only demo, not secure account isolation. The password hash and all POS data are stored in the browser, and a person with access to browser storage or developer tools can bypass the guard, read or alter data, or clear the password. It is not a substitute for server-side authentication and authorization or separate owner/developer accounts. Clearing browser data also removes the password and POS data. Do not rely on this for protecting sensitive business data.

In WhatsApp, an owner/developer can write an offer, append the available menu, and open a chat with a registered customer's number or another number. Egyptian local mobile numbers are converted automatically; other numbers should include their country code. Alternatively, choose a contact in WhatsApp. Each message must be reviewed and sent manually; WhatsApp and an internet connection are required. Only contact recipients who have consented.
