using System;
using System.Text.RegularExpressions;
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
            try
            {
                if (!String.IsNullOrEmpty(refererUrl))
                {
                    var refererUri = new Uri(refererUrl);

                    var domain = refererUri.Host.Replace("www.", "");

                    return $"{domain[0].ToString().ToUpper()}{domain.Substring(1, domain.Length - 1)}";
                }
            }
            catch (System.Exception)
            {

            }

            return null;
        }
    }
}