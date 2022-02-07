## CurtMe

[![CircleCI](https://circleci.com/gh/damianpumar/Curtme.svg?style=svg)](https://circleci.com/gh/damianpumar/Curtme)
![CodeQL](https://github.com/damianpumar/Curtme/workflows/CodeQL/badge.svg)
![CodeFactor](https://www.codefactor.io/repository/github/damianpumar/Curtme/badge)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/D1D11NVC3)

## :pencil: Pending requirements

- [x] Add safe browsing by google
- [x] Validate if sourceURL is a website
- [x] Website for end users
- [x] Show clicks on the fronted
- [x] Add login functionality
- [x] Add google analytics
- [x] Improve login styles (UI)
- [x] Allow user to create custom short URL
- [x] Track origin ip, user agent for each shorter link visited
- [x] Change ip-stack to ip-geolocation (save the current isp into database recollected in frontend right now)
- [x] Collect platform, operative system/version, browser/version from link was clicked
- [x] Delete link (soft delete)
- [x] Modify sourceURL
- [x] Password links
- [x] Collect user agent language
- [x] Social media share buttons
- [ ] Link redirect expiration by date
- [ ] Link redirect expiration by clicks
- [ ] Link rotation (Change sourceURL after specific event)
- [ ] QR code
- [ ] Link search by short and long link (front end)
- [ ] Enable or disable preview link
- [ ] Bulk short links
- [x] Chart of clicks on a short link by type of devices
- [x] Chart of clicks on a short link by platform / version
- [x] Chart of clicks on a short link by browser
- [x] Chart of clicks on a short link by referrals
- [x] Chart of clicks on a short link by city
- [x] Chart of clicks on a short link by country
- [ ] Chart of clicks on a short link by language
- [ ] Reset analytics for your short link
- [x] Share link stat with public url
- [ ] Add select language dropdown (EN, ES)

## :mag: API Documentation

- [Swagger docs](https://curtme.org/developer/)

## :pick: Built Using

- [netcore](https://dotnet.microsoft.com/download) - Backend
- [Svelte](https://svelte.dev/) - Frontend

## :rocket: Build and Release backend

## Dev environment

- Press F5 in vscode to debug the backend
  - Don't forget to run `dotnet dev-certs https` to install ssl certs for dev environment.
- `dotnet publish ./back/Curtme -c Release -o ./publish`

## :rocket: Build and Release frontend

- `cd front && npm run build`

## :balance_scale: License

MIT
