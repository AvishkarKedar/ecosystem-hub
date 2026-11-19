# 🌐 Avishkar Kedar — Ecosystem & Cloud Directory Hub

The central landing portal and unified gateway for Avishkar Kedar's cloud infrastructure, self-hosted services, and production web applications.

Deployed on **Cloudflare Pages** at [avishkarkedar.com](https://avishkarkedar.com).

---

## 🚀 Deployed Architecture & Subdomains

| Service / Subdomain | Target | Purpose | Protection / Ingress |
|---|---|---|---|
| **`avishkarkedar.com`** | Cloudflare Pages (`ecosystem-hub`) | Central Ecosystem & Cloud Directory Hub | Cloudflare Edge CDN |
| **`portfolio.avishkarkedar.com`** | Cloudflare Pages (`index-projects`) | Personal Developer Portfolio | Cloudflare Edge CDN |
| **`photos.avishkarkedar.com`** | Cloudflare Tunnel → `localhost:2283` | Immich Family Photos Hub | Native Immich Auth + WAF |
| **`os.avishkarkedar.com`** | Cloudflare Tunnel → `localhost:3000` | Cloud OS Webtop (Ubuntu Desktop) | Cloudflare Zero Trust (OTP) |
| **`vpn.avishkarkedar.com`** | Cloudflare Tunnel → `localhost:2053` | AViPN (3X-UI Web Management) | Cloudflare Zero Trust (OTP) |
| **`node.avishkarkedar.com:443`** | Direct VPS IP `129.146.59.56:443` | Censorship-Resistant VLESS-Reality Node | Microsoft SNI TLS 1.3 Camouflage |
| **`code.avishkarkedar.com`** | Cloudflare Pages (`textshare-2g0`) | AnonShare Real-time Encrypted Scratchpad | Edge CDN + VPS Relay |
| **`admincode.avishkarkedar.com`** | Cloudflare Pages (`textshare-admin`) | AnonShare Admin Console | Edge CDN |
| **`relay.avishkarkedar.com`** | Cloudflare Tunnel → `localhost:8787` | AnonShare WebSocket Relay | Live Node.js / PM2 on VPS |

---

## 🛠️ Features

- **Modern Glassmorphism Aesthetic:** Responsive dark theme with subtle neon glows, clean typography, and mobile-first layout.
- **Dynamic Search & Filtering:** Instant live filtering by keywords, categories (Cloud, Web Apps, VPN & Network, Open Source), and tags.
- **1-Click AViPN Configuration:** Copy direct 5G and domain-based VLESS connection URIs directly to the clipboard with toast feedback.
- **Connection Details Modal:** Complete inspection of Reality parameters (Camouflage SNI, ports, public keys, and flow controls).
- **System Telemetry:** Real-time visibility into Oracle Cloud ARM64 Ampere A1 compute, Linux 7.0 BBR kernel, and Cloudflare Tunnel routing.
- **Production Headers:** Optimized `_headers` and `_redirects` for Cloudflare Pages with HSTS, CSP, and strict caching.

---

## 📦 Deployment Instructions

### Cloudflare Pages
1. In Cloudflare Dashboard, go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Select repository `AvishkarKedar/ecosystem-hub`.
3. Set **Framework preset** to `None` (Static HTML).
4. Set **Build command** to `(empty)`.
5. Set **Build output directory** to `/`.
6. Add custom domain `avishkarkedar.com` and `www.avishkarkedar.com`.

---

© 2026 Avishkar Kedar.
