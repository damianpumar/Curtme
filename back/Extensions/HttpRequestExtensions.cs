using System;
using System.Linq;
using System.Net;
using Microsoft.AspNetCore.Http;

namespace Curtme.Extensions
{
    public static class HttpRequestExtensions
    {
        public static RequestInfo GetRequestInfo(this HttpContext context)
        {
            var requestInfo = new RequestInfo();

            requestInfo.Language = context.Request.GetTypedHeaders()
                                          .AcceptLanguage?
                                          .OrderByDescending(acceptedLanguage => acceptedLanguage.Quality ?? 1)
                                          .Select(language => language.ToString().Split('-')[0])
                                          .FirstOrDefault() ?? String.Empty;

            requestInfo.IpAddress = context.Connection.RemoteIpAddress;

            return requestInfo;
        }
    }

    public class RequestInfo
    {
        public String Language { get; set; }

        public IPAddress IpAddress { get; set; }
    }
}