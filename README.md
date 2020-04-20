## CurtMe

## Endpoints
  * https://curtme.org/ (POST - with url into body) to create your short link
  * https://curtme.org/{SHORTURL} (GET) redirect to your long URL
  * https://curtme.org/{SHORTURL}/stats (GET) get your stats
  
## For create your short link
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
  
## Redirect to your long URL
- Request
  browse to https://curtme.org/{SHORTURL}

## View your links stats
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
