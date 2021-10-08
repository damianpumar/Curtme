using System;

namespace Curtme.Extensions
{
    public static class UrlExtensions
    {
        public static Boolean IsValidURL(this String url)
        {
            return !String.IsNullOrEmpty(url)
                    &&
                    Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
                    &&
                    !uriResult.IsLoopback;
        }

        public static String GetDomainName(this String referrerUrl)
        {
            if (Uri.IsWellFormedUriString(referrerUrl, UriKind.Absolute))
            {
                var referrerUri = new Uri(referrerUrl);

                var domain = referrerUri.Host.Replace("www.", "");

                return $"{domain[0].ToString().ToUpper()}{domain.Substring(1, domain.Length - 1)}";
            }

            return "Unknown";
        }
    }
}