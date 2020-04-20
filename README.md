## CurtMe
[![CircleCI](https://circleci.com/gh/damianpumar/Curtme.svg?style=svg)](https://circleci.com/gh/damianpumar/Curtme)

## Pending requirements
 * Validate if long URL is a website :white_check_mark:	
 * Website for end users
 * Allow user to create custom short URL
 * Track origin ip, user agent for each shorter link visited

## Endpoints
  * https://curtme.org/ (POST - with url into body) to create your short link :scissors:	
  * https://curtme.org/{SHORTURL} (GET) redirect to your long URL :arrow_right:
  * https://curtme.org/{SHORTURL}/stats (GET) get your stats :bar_chart:
  
## For create your short link :scissors:	
- Request
  execute POST action to https://curtme.org/ with that body json type.
```
{
    "URL" : "https://YOUR-LONG-URL"
}
```
- Response
```
{
    "longURL": "https://YOUR-LONG-URL",
    "shortURL": "V6DARYX",
    "visited": 0
}
```
  
## Redirect to your long URL :arrow_right:
- Request
  browse to https://curtme.org/{SHORTURL}

## View your links stats :bar_chart:
- Request
  execute GET action to https://curtme.org/{SHORTURL}/stats
  
- Response
```
{
    "longURL": "https://YOUR-LONG-URL",
    "shortURL": "V6DARYX",
    "visited": 20
}
```

## Build and Release

- dotnet publish -c Release -o ./publish

## License
MIT
