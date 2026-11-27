# 🛡️ PhishingProof (PhishProof Lab)

**An interactive, bilingual phishing awareness lab: learn the red flags, inspect suspicious links, and test yourself with a randomized quiz.**

Built as the companion site for a Microsoft presentation on phishing and email security, and released as open source so anyone can use it, fork it, and adapt it for their own awareness sessions.

[Repository](https://github.com/mohamedtechturf/PhishingProof) · [MIT License](LICENSE)

> **Educational use only.** All examples are simulations. Phishing domains in the content are fictional, and no link in the app navigates anywhere or fetches a URL.

---

## ✨ Features

| Section | What it does |
|---|---|
| **Home** | Short intro to what phishing is and why it works, with quick entry points to Learn and Quiz. |
| **Learn** | 10 annotated case studies rendered as realistic mock emails (7 phishing, 3 legitimate). Interactive pins highlight each suspicious or trustworthy detail, followed by a red-flags or signs-of-legitimacy list and a key lesson. |
| **Techniques** | 12 technique cards: urgency and fear, look-alike domains, hyphen and subdomain tricks, shortened URLs, malicious attachments, generic greetings, credential or payment requests, executive impersonation (BEC), fake receipts and parcels, QR phishing (quishing), smishing and vishing, and MFA fatigue. |
| **URL Inspector** | Paste a link and see its real registrable domain plus warning signs. Runs entirely in the browser by parsing the text. It never opens or requests the URL. |
| **Quiz** | A bank of 20 emails (10 phishing, 10 legitimate). Each run draws 10 at random with 4 to 6 phishing emails, in shuffled order, and avoids repeating the previous run's questions when possible. Every answer gets an explanation. Your best score is saved locally. |
| **Cheat Sheet** | A one-page checklist of the habits that stop most phishing attacks. |

**Also included**

- 🌐 Full **Arabic (RTL) and English (LTR)** support with an instant language switch.
- 🌙 **Dark and light themes**, remembered between visits.
- 📱 Responsive layout with a mobile menu and keyboard-accessible controls.
- 🔒 No backend and no tracking. Preferences are stored only in your browser's `localStorage`.

### What the URL Inspector checks

- Real registrable domain (using the public suffix list via [`tldts`](https://github.com/remusao/tldts))
- Known URL shorteners (`bit.ly`, `tinyurl.com`, `t.co`, and others)
- Brand names used in a domain that doesn't belong to that brand (for example `microsoft365.com-aboracorp.net`)
- Punycode (`xn--`) lookalike hostnames
- Credentials embedded in the URL
- IP-address or local hosts
- Unusual ports

---

## 🧰 Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/) plus custom CSS
- [lucide-react](https://lucide.dev/) icons
- [tldts](https://github.com/remusao/tldts) for domain parsing

---

## 🚀 Getting started

**Requirements:** Node.js 20.19 or newer, and npm.

```bash
# 1. Clone the repository
git clone https://github.com/mohamedtechturf/PhishingProof.git
cd PhishingProof

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open the local URL that Vite prints (usually `http://localhost:5173`).

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript type check |

The production build is a static site, so it can be hosted anywhere (GitHub Pages, Netlify, Vercel, Azure Static Web Apps, or a plain web server).

---

## 📁 Project structure

```
PhishingProof/
├── index.html            # App entry point
├── src/
│   ├── main.tsx          # React bootstrap
│   ├── App.tsx           # Layout, sections, quiz logic, URL inspector
│   ├── data.ts           # All content: translations, cases, quiz bank, techniques
│   ├── index.css         # Styling (themes, RTL/LTR, email cards)
│   └── logo.png          # Logo and favicon
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

All learning content lives in `src/data.ts`, so you can customize the site without touching the UI code.

---

## ✍️ Customizing the content

Every human-readable string is bilingual. The `b(ar, en)` helper creates a `{ ar, en }` pair:

```ts
title: b('الاستعجال والخوف', 'Urgency and fear')
```

Common changes:

- **Add or edit quiz emails:** edit the `quizBank` array in `src/data.ts`. Each entry is an email (sender, subject, body, links, attachments) with an `isPhishing` flag, an explanation, and its signs, in both languages.
- **Edit Learn case studies:** edit `learnCases`, including the pins that point at parts of each email.
- **Add a technique:** add an entry to `techniqueCards` with `id`, `title`, `definition`, `example`, and `detect`.
- **Change UI text:** edit the `translations` object.
- **Change the quiz length:** adjust the selection logic in `createQuizSet` in `src/App.tsx`.

Keep the quiz bank balanced between phishing and legitimate emails, and use fictional or reserved domains for phishing examples.

---

## 🎤 Using it in a presentation

A suggested flow for a 10 to 15 minute session:

1. **Hook:** open the Home section and explain why email is the most common way in.
2. **Learn:** walk through two or three cases, clicking the pins to reveal the red flags live. The CEO fraud and the hyphen-URL cases land well.
3. **Techniques:** show the URL Inspector with `microsoft365.com-aboracorp.net` to demonstrate how the real domain is hidden.
4. **Quiz:** let the audience vote on each email, then reveal the explanation.
5. **Wrap up:** finish on the Cheat Sheet and ask people to keep the checklist.

Switch the language or theme from the top bar to match your audience and projector.

---

## 🤝 Contributing

Contributions are welcome:

1. Fork the repo and create a branch: `git checkout -b feature/my-improvement`
2. Make your changes and run `npm run lint` and `npm run typecheck`
3. Open a pull request describing what you changed and why

Ideas that would help: more quiz emails, additional languages, new techniques, and accessibility improvements.

**Content guidelines**

- Keep everything defensive and educational. Don't add real malicious links, real malware, or working attack code.
- Provide both Arabic and English text for any new content.

---

## 📄 License

Released under the [MIT License](LICENSE). Free to use, modify, and share.

---

## 🇪🇬 ملخص بالعربي

**PhishingProof** موقع تفاعلي ثنائي اللغة (عربي / English) لتعليم اكتشاف رسائل التصيد (Phishing). يحتوي على 10 حالات شرح مفصلة بصور بريد محاكية، و12 أسلوب احتيال، وأداة لفحص الروابط تعمل داخل المتصفح فقط، واختبار عشوائي من 10 أسئلة مع شرح لكل إجابة، وقائمة مراجعة سريعة. المشروع مفتوح المصدر بترخيص MIT، وتم إنشاؤه كجزء من عرض تقديمي عن أمن البريد الإلكتروني. للتشغيل: `npm install` ثم `npm run dev`.
