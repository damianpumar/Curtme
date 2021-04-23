using System;
using Microsoft.AspNetCore.Http;

namespace Curtme.Extensions
{
    public static class URLExtensions
    {
        public static Boolean IsValidURL(this String url)
        {
            return !String.IsNullOrEmpty(url)
                    &&
                    Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
                    &&
                    !uriResult.IsLoopback;
        }

        public static Boolean IsSameDomain(this String url, HttpContext context)
        {
            return Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
                   uriResult.Authority == context.GetAbsoluteUri().Authority;
        }

        private static Uri GetAbsoluteUri(this HttpContext context)
        {
            UriBuilder uriBuilder = new UriBuilder();
            uriBuilder.Scheme = context.Request.Scheme;
            uriBuilder.Host = context.Request.Host.Host;
            uriBuilder.Path = context.Request.Path.ToString();
            uriBuilder.Query = context.Request.QueryString.ToString();

            return uriBuilder.Uri;
        }
    }
}