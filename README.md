## CurtMe

[![CircleCI](https://circleci.com/gh/damianpumar/Curtme.svg?style=svg)](https://circleci.com/gh/damianpumar/Curtme)
![CodeQL](https://github.com/damianpumar/Curtme/workflows/CodeQL/badge.svg)
![CodeFactor](https://www.codefactor.io/repository/github/damianpumar/Curtme/badge)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/D1D11NVC3)

## :pencil: Pending requirements

- Validate if longURL is a website :white_check_mark:
- Website for end users :white_check_mark:
- Show clicks on the fronted :white_check_mark:
- Add login functionality :white_check_mark:
- Add google analytics :white_check_mark:
- Improve login styles (UI) :white_check_mark:
- Allow user to create custom short URL :white_check_mark:
- Track origin ip, user agent for each shorter link visited :white_check_mark:
- Change ip-stack to ip-geolocation (save the current isp into database recollected in frontend right now)
- Allow to modify longURL
- Allow to delete link
- Add social media share buttons
- Add expiration time to links
- Add server from link was clicked
- Add operative system from link was clicked

## :mag: API Documentation

- [Swagger docs](https://curtme.org/developer/)

## :pick: Built Using

- [netcore](https://dotnet.microsoft.com/download) - Backend
- [Svelte](https://svelte.dev/) - Frontend

## :rocket: Build and Release backend

- dotnet publish ./back -c Release -o ./publish

## :rocket: Build and Release frontend

- cd front && npm run build

## :balance_scale: License

MIT
