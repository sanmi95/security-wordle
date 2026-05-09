# Security Wordle: Daily Awareness Challenge

> A Wordle-style daily security awareness game built for enterprise security teams. Employees guess a cybersecurity term in 6 attempts, reinforcing security vocabulary through daily gamified engagement.

---

## Overview

Security Wordle is a browser-based, single-file application that puts a security awareness spin on the classic word-guessing game format. It was built as a gamified training tool (part of a broader enterprise security awareness program) to make daily security education feel less like a policy doc and more like a two-minute game.

The word is set by an admin each day via a password-protected panel and served from a static `word.json` file through Netlify. Players get 6 attempts to guess the 5-letter cybersecurity term, with color-coded tile feedback guiding each guess.

---

## How It Works

On page load the app fetches today's word from `word.json` and initializes the 6-row guess grid. Every key press (physical or on-screen) updates the active tile in real time. On submission, each tile flips to reveal its color state. At the end of the game, a modal shows the result with a shareable emoji grid the player can copy and paste.

Admins access the panel via the ⚙ button in the header. After entering the correct password (validated server-side by the Netlify function), they can type a new 5-letter word and deploy it. The function writes the word to `word.json` and triggers a Netlify redeploy, making the new word live within about 20 seconds.

---

## Features

- **Daily word challenge** served from a static `word.json` file via Netlify
- **6-attempt guess grid** with flip animation and color-coded feedback
- **On-screen keyboard** that tracks letter states across guesses
- **Shareable emoji result** copied to clipboard with one click
- **Password-protected admin panel** for deploying new daily words
- **Netlify serverless function** (`set-word`) handles word updates and password validation
- **Loading screen** with spinner while the word fetches
- **Toast notifications** for invalid guesses and confirmations
- **Responsive layout** down to 380px viewport
- **Zero dependencies** beyond Google Fonts; no frameworks, no build step

---

## Color Key

| Color | Meaning |
|---|---|
| 🟦 Green tile | Correct letter, correct position |
| 🟨 Yellow tile | Correct letter, wrong position |
| ⬜ Grey tile | Letter not in the word |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | Vanilla HTML5 |
| Styling | Vanilla CSS3 (custom properties, flexbox) |
| Logic | Vanilla JavaScript (ES6+, no build step) |
| Serverless | Netlify Functions (Node.js) |
| Word storage | Static `word.json` file |
| Fonts | Google Fonts: Nunito, Nunito Sans |
| Hosting | Netlify |

---

## Project Structure

```
security-wordle/
├── index.html              # Entire frontend: HTML + CSS + JS in one file
├── word.json               # Current daily word (updated by admin via set-word function)
├── netlify.toml            # Netlify build and redirect config
└── netlify/
    └── functions/
        └── set-word.js     # Serverless function: validates password and updates word.json
```

---

## Deployment

### Prerequisites

- A [Netlify](https://netlify.com) account
- The repo connected to Netlify with auto-deploy enabled

### Environment Variables

Set the following in **Netlify > Site Settings > Environment Variables**:

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Password used to authenticate the admin panel |

### Deploy Steps

1. Fork or clone this repo
2. Connect it to Netlify (drag-and-drop or CLI)
3. Set the `ADMIN_PASSWORD` environment variable
4. Deploy. The site will be live at your Netlify URL.

To serve locally without Netlify functions:

```bash
# Python 3
python -m http.server 8080

# Node
npx serve .
# Then open http://localhost:8080
```

Note: the admin panel's deploy feature requires Netlify functions. Local serving will use the fallback word `CRYPT` if `word.json` is not present.

---

## Admin Panel

Click the **⚙ Admin** button in the top-right corner to open the panel.

1. Enter the admin password (set via `ADMIN_PASSWORD` in Netlify)
2. View the currently active word
3. Type a new 5-letter word in the input field
4. Click **Deploy Word**. The function validates the password, writes the new word to `word.json`, and triggers a Netlify redeploy.
5. The new word is live for all players within ~20 seconds

To change the admin password, update the `ADMIN_PASSWORD` environment variable in Netlify and redeploy.

---

## Security Awareness Context

This project was built as part of an enterprise-wide security awareness program. The goal was to give employees a 2-minute daily touchpoint with security terminology (terms like `PATCH`, `OAUTH`, `CRYPT`, `PROXY`, and `AUDIT`) in a format they'd actually want to open.

It complements phishing simulations and formal training by keeping security top-of-mind in a low-pressure, gamified way. The share functionality encourages organic peer engagement when employees post their results.

---

## Author

**Gerardo Hernandez**
Security Analyst Lead | Adjunct Professor | Doctoral Candidate in Engineering (AI/ML)

- GitHub: [github.com/sanmi95](https://github.com/sanmi95)
- LinkedIn: [linkedin.com/in/gerardo-hernandez-b19172120](https://linkedin.com/in/gerardo-hernandez-b19172120)

---

## License

MIT License. Feel free to fork and adapt for your own security awareness program.
