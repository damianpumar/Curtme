## CurtMe

[![CircleCI](https://circleci.com/gh/damianpumar/Curtme.svg?style=svg)](https://circleci.com/gh/damianpumar/Curtme)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/D1D11NVC3)

## Pending requirements

- Validate if long URL is a website :white_check_mark:
- Website for end users :white_check_mark:
- Show clicks on the fronted :white_check_mark:
- Add login functionality :white_check_mark:
- Add google analytics :white_check_mark:
- Improve login styles (UI) :white_check_mark:
- Allow user to create custom short URL :white_check_mark:
- Track origin ip, user agent for each shorter link visited :white_check_mark:
- Change ip-stack to ip-geolocation (save the current isp into database recollected in front end right now

## Documentation

- [Swagger docs](https://curtme.org/developer/)

## Build and Release backend

- dotnet publish ./back -c Release -o ./publish

## Build and Release frontend

- cd front && npm run build

## License

MIT
