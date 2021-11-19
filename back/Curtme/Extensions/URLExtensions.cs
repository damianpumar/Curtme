using System;
using System.Text.RegularExpressions;

namespace Curtme.Extensions
{
    public static class UrlExtensions
    {
        public static Boolean IsValidURL(this String url)
        {

            return !String.IsNullOrEmpty(url) &&
                    Regex.IsMatch(url, @"^(http|https|ftp)\://[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?/?([a-zA-Z0-9\-\._\?\,\'/\\\+&amp;%\$#\=~])*[^\.\,\)\(\s]$");
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