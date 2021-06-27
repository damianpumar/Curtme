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

        public static String GetDomainName(this String refererUrl)
        {
            if (!String.IsNullOrEmpty(refererUrl))
            {
                var refererUri = new Uri(refererUrl);
                var uriSplitted = refererUri.Host.Split('.');
                var domain = uriSplitted[uriSplitted.Length - 2];

                return $"{domain[0].ToString().ToUpper()}{domain.Substring(1, domain.Length - 1)}";
            }

            return null;
        }
    }
}