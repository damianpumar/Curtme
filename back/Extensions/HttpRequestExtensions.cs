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

            requestInfo.Origin = context.GetDomainReferer();

            return requestInfo;
        }

        private static String GetDomainReferer(this HttpContext context)
        {
            var refererUrl = context.Request.Headers["Referer"].FirstOrDefault();

            if (!String.IsNullOrEmpty(refererUrl))
            {
                var refererUri = new Uri(refererUrl);
                var uriSplitted = refererUri.Host.Split('.');
                var domain = uriSplitted[uriSplitted.Length - 2];

                return $"{domain[0].ToString().ToUpper()}{domain.Substring(1, domain.Length - 1)}";
            }

            return "Unknown";
        }
    }

    public class RequestInfo
    {
        public String Language { get; set; }

        public IPAddress IpAddress { get; set; }

        public String Origin { get; set; }
    }
}